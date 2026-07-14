const cloudinary = require('cloudinary').v2;
const Problem = require("../models/problem");
const User = require("../models/user");
const SolutionVideo = require("../models/solutionVideo");
const { sanitizeFilter } = require('mongoose');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;

    if (!req.result || !req.result._id) {
    return res.status(401).json({
        success:false,
        message:"Unauthorized"
    });
    }
    
    const userId = req.result._id;

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Problem Id"
        });
    }

    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success:false,
        message:"Problem Not Found"
      });
    }

     // Check if Video Already Exists
    const existingVideo = await SolutionVideo.findOne({problemId});

     if (existingVideo) {
      return res.status(409).json({
        success: false,
        message: "A solution video already exists for this problem.",
      });
    }

    // Generate unique public_id for the video
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const publicId = `codehub-solutions/${problemId}/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      success:true,
      message: "Upload signature generated successfully.",
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({
        success:false,
        message:"Internal Server Error"
    });
  }
};

const saveVideoMetadata = async (req, res) => {
  try {
    const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      title,
      description
    } = req.body;

    if(!problemId||!cloudinaryPublicId||!secureUrl||!title||!description){
      return res.status(400).json({
        success:false,
        message:"Please Provide All fields"
      })
    }
  

    if (!req.result || !req.result._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validate Problem Id
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Problem Id",
      });
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    // Prevent Duplicate Video
    const existingVideo = await SolutionVideo.findOne({problemId});


    if (existingVideo) {
      return res.status(409).json({
        success: false,
        message: "A solution video already exists for this problem.",
      });
    }

    const userId = req.result._id;

    // Verify the upload with Cloudinary
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );

    if (!cloudinaryResource) {
      return res.status(400).json({
        success:false,
        message:"Video Not Found"
      });
    }

    if (cloudinaryResource.secure_url !== secureUrl) {
    return res.status(400).json({
        success: false,
        message: "Invalid Cloudinary resource."
    });
}

   

    const thumbnailUrl = cloudinary.url(cloudinaryResource.public_id, {
    resource_type: 'video', 
    format:'jpg',
    transformation: [
    { width: 400, height: 225, crop: 'fill' },
    { quality: 'auto' },
    { start_offset: 'auto' }  
    ]
    });

    // Create video solution record
    const videoSolution = new SolutionVideo({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration,
      thumbnailUrl,

      format: cloudinaryResource.format,
      bytes: cloudinaryResource.bytes,
      version: cloudinaryResource.version,

      title,
      description,

      isPublished: true,
    });

    await videoSolution.save();


    res.status(201).json({
      success:true,
      message: 'Video solution saved successfully',
      videoSolution
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({
      success:false,
      message:"failed to save video metadata"
    });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Authentication Check
    if (!req.result || !req.result._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Validate Video Id
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Video Id",
      });
    }

    // Find Video
    const video = await SolutionVideo.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Delete Video From Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.destroy(
      video.cloudinaryPublicId,
      {
        resource_type: "video",
        invalidate: true,
      }
    );

    // Verify Cloudinary Deletion
    if (cloudinaryResponse.result !== "ok") {
      return res.status(500).json({
        success: false,
        message: "Failed to delete video from Cloudinary.",
      });
    }

    // Delete MongoDB Record
    await SolutionVideo.findByIdAndDelete(videoId);

    return res.status(200).json({
      success: true,
      message: "Video deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Video Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete video.",
    });
  }
};


module.exports={generateUploadSignature,saveVideoMetadata,deleteVideo}