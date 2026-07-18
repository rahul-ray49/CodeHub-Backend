const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{
        type: String,
        require: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,
    },
    emailId:{
        type:String,
        require:true,
        unique:true,
        trim: true,
        lowercase:true,
        immutable: true,
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    isVerified:{
         type:Boolean,
         default:false
    },
    verificationToken:{
         type:String
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
        default:[]
    },
    password:{
        type:String,
        require:true,
        minLength:8,
    },
    userScore:{
        type:Number,
        default:0
    },
    profileImage: {
    url: {
        type: String,
        default: ""
    },
    public_id: {
        type: String,
        default: ""
    }
    },
    about: {
        type: String,
        trim:true,
        maxlength: 300,
        default: "Passionate programmer exploring new technologies and solving problems."
    }
},{
    timestamps:true
});

userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
      await mongoose.model('submission').deleteMany({ userId: userInfo._id });
    }
});
/* 
ye basically kaam kuch aisa karega
humne deleteUser route mai user ko delete kara hoga so humne waha par
chalaya tha query await User.findIdandDelete(userId)

toh jab user delete ho jayega toh 
userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
      await mongoose.model('submission').deleteMany({ userId: userInfo._id });
    }
});
ye wala method chalega ismein kuch field hai  like findOneAndDelete ye batata 
jab query mai ye di gayi ho toh isse chalana

jo User delete hua hoga uski object aake function ke parameter mai jayega

phir hum submission model mai jaha bhi userId uss particular user se milti ho unn saare
submission records ko delete kar denge

*/


const User = mongoose.model("user",userSchema);

module.exports = User;