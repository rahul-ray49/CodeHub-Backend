const mongoose =require('mongoose');
const Schema=mongoose.Schema;


const submissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'c++', 'java'] 
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Wrong Answer', 'Compilation Error','Runtime Error','Time Limit Exceeded'],
    default: 'Pending'
  },
  runtime: {
    type: Number,  // milliseconds
    default: 0
  },
  memory: {
    type: Number,  // kB
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  testCasesTotal: {  // Recommended addition
    type: Number,
    default: 0
  },
  contestId: {
    type: Schema.Types.ObjectId,
    ref: "contest",
    default: null
},
submissionType: {
    type: String,
    enum: ["Practice", "Contest"],
    default: "Practice"
}
}, { 
  timestamps: true
});

submissionSchema.index({userId:1,problemId:1});

const Submission = mongoose.model('submission',submissionSchema);

module.exports = Submission;
