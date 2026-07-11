const express=require('express');
const app=express();
const dbConnect = require('./config/db');
require('dotenv').config();
const User = require('./models/user');
const cookieParser = require('cookie-parser');
const cors=require('cors');

const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter=require("./routes/problemCreator");
const submitRouter = require('./routes/submit');
const verifyEmailRouter = require('./routes/verifyEmailRouter');
const submissionHistoryRouter=require("./routes/submissionHistory");
const aiRouter=require("./routes/aiRoutes");



app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());



app.use('/user',authRouter);
app.use('/email',verifyEmailRouter)
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/history',submissionHistoryRouter);
app.use('/ai',aiRouter);


const InitializeConnection=async()=>{
    try{
        await Promise.all([dbConnect(),redisClient.connect()]);
        console.log("All connections initialized");
        app.listen(process.env.PORT, ()=>{
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }
    catch(error){
        console.error("Error initializing connections:", error);
    }
}
InitializeConnection();
// dbConnect().then(async()=>{
//     console.log("DB Connected");
//     app.listen(process.env.PORT, ()=>{
//         console.log(`Server is running on port ${process.env.PORT}`);
//     });
// });
