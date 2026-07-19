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
const videoRouter = require('./routes/videoCreator');


app.use(cors({
  origin: process.env.FRONTEND_URL,
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
app.use('/video',videoRouter);

const PORT = process.env.PORT || 8000;
const InitializeConnection=async()=>{
    try{
        await Promise.all([dbConnect(),redisClient.connect()]);
        console.log("All connections initialized");
        app.listen(PORT, ()=>{
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
