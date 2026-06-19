const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const Problem=require("../models/problem");
const User =require("../models/user");
const Submission=require("../models/submission");



const createProblem=async(req,res)=>{

   const {title,description,difficulty,tags,visibleTestCases,
    hiddenTestCases,startCode,referenceSolution,problemCreator,score
   }=req.body;
   try{
       const numericscore=Number(score);
       if(isNaN(numericscore)){
            return res.status(400).send("Invalid Score");
       }
    for(const {language,completeCode} of referenceSolution){


        //source_code:
        //language_id:
        //stdin:
        //expectedOutput:

        const languageId=getLanguageById(language);

        //creating a batch submission 
        const submissions=visibleTestCases.map((testcase)=>({
            source_code:completeCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }));

        const submitResult=await submitBatch(submissions);
        //submitBatch call hone par woh ek array of tokens dega in the from
        //[{token:"..."},{token:"..."},{token:"..."}]

        const resultToken=submitResult.map((value)=>value.token);
        //ye fucntion call hone par basically yeh ek array of token
        //dega in the form ["...","...","..."]

        const testResult=await submitToken(resultToken);
        //ye fucntion resultToken lega aur response layega from judge0

        for(const test of testResult){
            if(test.status_id!=3){
                return res.status(400).send("Error Occured While testing problem");
            }
        }
        //ye for loop ye ensure karta hai ki jo bhi source code humne diya hai
        //uss source code par jab humne testcases ko chalaye toh kya woh expected output diya ya nahi
        //agar expected output nahi diye hote toh iska matlab humare source code mai kuch galti hai
        //source code tabhi pass honge jab status_id==3 hogi
        //nahi toh error throw karenge

    }
    //ek baar ye saari source code and all testcase pass ho gaye abb hum iss
    //problem ko database mai save kar sakte hai

    const userProblem=await Problem.create({
        ...req.body,
        problemCreator:req.result._id
    });

    res.status(201).send("problem Saved SuccessFully");
   
   }
   catch(err){
       res.status(400).send("Error occured While solving th problem"+err);
   }

}



const updateProblem = async(req,res)=>{
    const {id}=req.params;
    //humne probkem ki id nikali from the request

    const {title,description,difficulty,tags,
    visibleTestCases,hiddenTestCases,startCode,score,
    referenceSolution, problemCreator
   } = req.body;

   try{
      
      const numericscore=Number(score);
       if(isNaN(numericscore)){
            return res.status(400).send("Invalid Score");
       }

    if(!id){
      return res.status(400).send("Missing ID Field");
     }
     //agar id nahi aayi toh error response bhejo

    const DsaProblem =  await Problem.findById(id);
    if(!DsaProblem)
    {
    return res.status(404).send("problem with such ID is not persent in server");
    }
    //agar id bheji gayi hai toh toh uss id ke related problem ko retrieve 
    //from the database agar aisi koi entry nahi hai toh error response bhejo
    
    for(const {language,completeCode} of referenceSolution){
             
    
          // source_code:
          // language_id:
          // stdin: 
          // expectedOutput:
    
          const languageId = getLanguageById(language);
            
          // I am creating Batch submission
          const submissions = visibleTestCases.map((testcase)=>({
              source_code:completeCode,
              language_id: languageId,
              stdin: testcase.input,
              expected_output: testcase.output
          }));
    
    
          const submitResult = await submitBatch(submissions);
          // console.log(submitResult);
    
          const resultToken = submitResult.map((value)=> value.token);
    
          // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]
          
         const testResult = await submitToken(resultToken);
    
        //  console.log(testResult);
    
         for(const test of testResult){
          if(test.status_id!=3){
           return res.status(400).send("Error Occured while Testing testcases");
          }
         }
    
        }
        //yeh code humne phir se chalaya taki jo updation ke liye hum bhej
        //rahe all the sorce code and all woh correct hai ki test karo


    const newProblem = await Problem.findByIdAndUpdate(id , {...req.body}, {runValidators:true, new:true});
    //agar sara source code sai hai judge0 ne clearance dedi toh problem ko update kar do in database 

    res.status(200).send(newProblem);

   }
   catch(err){
      res.status(500).send("Error in create Problem:"+err);

   }









}



const deleteProblem=async(req,res)=>{

      const {id} = req.params;
      //id retrieve karo

      try{


      if(!id)
      return res.status(400).send("ID is Missing");
      //checks whether id is being provided or not
      

    const deletedProblem = await Problem.findByIdAndDelete(id);
    //findIdandDelete basically us problem ko dhundta hai aur agar uss id ki problem hai toh usse delete karke wahi return kar deta hai

    if(!deletedProblem)
    return res.status(404).send("Problem is Missing");
    //agar object return nahi aaya iska matlab object present he nahi tha 
      

    res.status(200).send("successfully Deleted");
      }
      catch(err){
      res.status(500).send("Error in problem deletion: "+err);

      }



}




const getProblemById = async(req,res)=>{

  const {id} = req.params;
  try{
     
    if(!id)
      return res.status(400).send("ID is Missing");

    const getProblem = await Problem.findById(id).select('_id title description difficulty tags score visibleTestCases startCode referenceSolution');
    //only the following field will be shown while fetching a problem



   if(!getProblem)
    return res.status(404).send("Problem is Missing");


   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}




const getAllProblem = async(req,res)=>{

  try{
     
    const getProblem = await Problem.find({}).select('_id title difficulty tags score');
    //only these field will be shown when we will fetch all problems


   if(getProblem.length==0)
    return res.status(404).send("Problems are Missing");


   res.status(200).send(getProblem);
  }
  catch(err){
    res.status(500).send("Error: "+err);
  }
}


const solvedAllProblembyUser=async(req,res)=>{

  try{
      const userId=req.result._id;

      const user=await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags score"
      })
      //so basically user model mai problemSolved field mai problem ki id he sirf hogi
      //so ek ek prolem ki id ko lekar database ko call karna is not a good task
      //so we use populate 
      //populate basically kya krta hai problemSolved mai jo ids hai unhe 
      //actual document se replace kar deta hai 
      // phir select field ke through humne humein jo jo field chahiye usse select kar liya

      res.status(200).send(user.problemSolved);
      
  }

  catch(err){
       res.status(500).send("Server Error in solvedAllProblemByUser section");

  }

}

const submittedProblem=async(req,res)=>{
//ye controller basically user ne ek particular problem ko kitne baar submit 
//uska history deta hai

  try{

    const userId=req.result._id;

    const problemId=req.params.pid;
    
    const ans=await Submission.find({userId,problemId});
    /* 
    so basically humare submission schema mai problem ki submission ka history hai
    usmein problem ki id aur user ki id bhi hogi 

    so agar hum kisi user ki ek particular problem ko search karein toh
    hume saare document ko ek ek karke search larna padega aur jaha bhi
    userid aur problemid humare diye gaye parameter ke saath match hogi
    woh document hum paas karenge 
    
    lekin isse humari jo time for search woh bahut jyada ho jayegi iske liye hum
    use karte hai indexing 

    toh humne ek compound indexing create kari {userId,problemId} in submission schema
    abb sorted order mai presnt honge document so time thodi kam lagegi 
    
    
    */

    if(ans.length==0)
      res.status(200).send("No submission is present");

    res.status(200).send(ans);
  }
  catch(err){
    res.status(500).send("Internal server error in submittedProblem section");
  }
}


module.exports={createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblembyUser,submittedProblem}





// const submissions = [
//     {
//       "language_id": 46,
//       "source_code": "echo hello from Bash",
//       stdin:23,
//       expected_output:43,
//     },
//     {
//       "language_id": 123456789,
//       "source_code": "print(\"hello from Python\")"
//     },
//     {
//       "language_id": 72,
//       "source_code": ""
//     }
//   ]


/*
1.so basically jab koi admin problem create karta hai tab 
woh title,description,difficulty,tags,visibletestcases,hiddentestcase and all provide karta hai
2.abb har problem ke corresponding alag alag language mai alag alag complete souce code bhi admin dega .
3.ye sab referenceSolution mai present hoga the language and the code 
4. iss referenceSolution array par loop chalenge
5.har language ke corresponding ek id milegi
6.phir ek submission batch create hoga 
7.ye submission batch ko bheja jaega judge0 ko for further operation
*/