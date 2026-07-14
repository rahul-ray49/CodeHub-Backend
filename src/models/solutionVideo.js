const mongoose=require('mongoose');
const {Schema}=mongoose;


const videoSchema = new Schema(
{
    problemId:{
        type:Schema.Types.ObjectId,
        ref:"problem",
        required:true,
        unique:true
    },
    
    userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
   },

    cloudinaryPublicId:{
        type:String,
        required:true,
        unique:true
    },

    secureUrl:{
        type:String,
        required:true
    },

    thumbnailUrl:{
        type:String
    },

    duration:{
        type:Number,
        required:true
    },

    format:{
        type:String,
        enum:["mp4","mov","avi","webm","mkv"]

    },

    bytes:{
        type:Number
    },

    version:{
        type:String
    },

    title:{
        type:String,
        trim:true
    },

    description:{
        type:String,
        trim:true
    },

    isPublished:{
        type:Boolean,
        default:true
    }
},
{
    timestamps:true
}
);

const SolutionVideo=mongoose.model("solutionVideo",videoSchema);

module.exports=SolutionVideo;