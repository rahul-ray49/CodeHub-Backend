const Problem = require("../models/problem");
const Submission = require("../models/submission");
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const {decode}=require("../utils/decodeResult");



const submitCode = async (req,res)=>{

 
   
    try{
       const userId = req.result._id;
       const problemId = req.params.id;

       const {code,language} = req.body;

      if(!userId||!code||!problemId||!language)
        return res.status(400).json({
        success:false,
        message:"some fields are missing"
      })

      // Fetch the problem from database
       const problem =  await Problem.findById(problemId);

       if(!problem)
        return res.status(404).json({
         success:false,
         message:"problem not found"
      })

      // Kya apne submission store kar du pehle....
       const submittedResult = await Submission.create({
          userId,
          problemId,
          code,
          language,
          status:'Pending',
          testCasesTotal:problem.hiddenTestCases.length
      });

      const languageId = getLanguageById(language);

      const submissions = problem.hiddenTestCases.map((testcase)=>({
        source_code: Buffer.from(code, "utf8").toString("base64"),
        language_id: languageId,
        stdin:Buffer.from(testcase.input, "utf8").toString("base64"),
        expected_output:Buffer.from(testcase.output,"utf8").toString("base64")
      }));

      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value)=> value.token);

      const testResult = await submitToken(resultToken);


      const decodedResult = testResult.map((tc) => ({
        ...tc,

        stdout: decode(tc.stdout),
        stderr: decode(tc.stderr),
        compile_output: decode(tc.compile_output),
        stdin: decode(tc.stdin),
        expected_output: decode(tc.expected_output),
    }));


     const cleanResult = decodedResult.map((tc) => ({
        token: tc.token,
        stdin: tc.stdin,
        expected_output: tc.expected_output,
        stdout: tc.stdout,
        stderr: tc.stderr,
        compile_output: tc.compile_output,
        status_id: tc.status_id,        
        status: tc.status.description,  
        time: tc.time,
        memory: tc.memory
      }));
    

      const passedCases = cleanResult.filter(
          tc => tc.status_id === 3
        ).length;

      const firstFailedCase = cleanResult.find(
          tc => tc.status_id !== 3
      );


       if(firstFailedCase?.status==="Compilation Error"){

        submittedResult.status="Compilation Error";
        submittedResult.testCasesPassed=0;
        submittedResult.errorMessage =firstFailedCase.compile_output;
        submittedResult.runtime =null;
        submittedResult.memory =null;

        await submittedResult.save();

      return res.status(200).json({

          success:false,
          resultType:"Compilation Error",
          passedCases:0,
          totalCases:cleanResult.length,
          compileOutput:firstFailedCase.compile_output,
          testCases:cleanResult,
          runtime:null,
          memory:null

      });

    }

    if(firstFailedCase?.status.startsWith("Runtime Error")){

        submittedResult.status="Runtime Error";
        submittedResult.testCasesPassed=passedCases;
        submittedResult.errorMessage =firstFailedCase.stderr;
        submittedResult.runtime =null;
        submittedResult.memory =null;

        await submittedResult.save();

      return res.status(200).json({

        passedCases:passedCases,
        totalCases:cleanResult.length,
        success:false,
        resultType:"Runtime Error",
        runtimeOutput:firstFailedCase.stderr,
        testCases:cleanResult,
        runtime:null,
        memory:null

    });

  }


    if(firstFailedCase?.status === "Time Limit Exceeded"){




        submittedResult.status="Time Limit Exceeded";
        submittedResult.testCasesPassed=passedCases;
        submittedResult.errorMessage ="Time Limit Exceeded";
        submittedResult.runtime =null;
        submittedResult.memory =null;

        await submittedResult.save();




    return res.status(200).json({

        success: false,
        resultType: "Time Limit Exceeded",
        passedCases: passedCases,
        totalCases: cleanResult.length,
        testCases: cleanResult,
        runtime:null,
        memory:null

    });

}


   if(passedCases!==cleanResult.length){

    let testCasesPassed=0;
    let runtime=0;
    let memory=0;


    for(const test of cleanResult){

          if(test.status_id===3){

             testCasesPassed++;

          }

          runtime = runtime +  Number(test.time || 0);
          memory = Math.max(memory,test.memory||0); 
        }

        submittedResult.status="Wrong Answer";
        submittedResult.testCasesPassed=testCasesPassed;
        submittedResult.errorMessage ="Wrong Answer";
        submittedResult.runtime =runtime;
        submittedResult.memory =memory;

        await submittedResult.save();

        return res.status(200).json({

            success:false,
            resultType:"Wrong Answer",
            passedCases,
            runtime,
            memory,
            totalCases:cleanResult.length,
            testCases:cleanResult

        });

}

 
    let testCasesPassed=0;
    let runtime=0;
    let memory=0;


     for(const test of cleanResult){

          if(test.status_id===3){

             testCasesPassed++;
             runtime = runtime +  Number(test.time || 0);
             memory = Math.max(memory,test.memory||0);

          }
     }

        submittedResult.status="Accepted";
        submittedResult.testCasesPassed=testCasesPassed;
        submittedResult.errorMessage =null;
        submittedResult.runtime =runtime;
        submittedResult.memory =memory;

        await submittedResult.save();

        if(!req.result.problemSolved.some(id=>id.toString()===problemId)){
          req.result.problemSolved.push(problemId);
          req.result.userScore+=Number(problem.score);
          await req.result.save();

        }

      

    



      // Problem ko tabhi solved mark karenge jab verdict Accepted ho
      // Aur agar pehle se solved list me present nahi hai

     

      res.status(200).json({
        resultType: "Accepted",
        success:true,
        runtime,
        memory,
        passedCases,
        totalCases: cleanResult.length,
        testCases: cleanResult
      });

    }
    catch(err){
     return res.status(500).json({
      success:false,
      message:"Internal server Error"
   });

   }
}

/* 
const submitCode = async (req,res)=>{
   
    // 
    try{
       const userId = req.result._id;
       const problemId = req.params.id;

       const {code,language} = req.body;

      if(!userId||!code||!problemId||!language)
        return res.status(400).send("Some field missing");

    //    Fetch the problem from database
       const problem =  await Problem.findById(problemId);
    //    testcases(Hidden)

    //   Kya apne submission store kar du pehle....
    const submittedResult = await Submission.create({
          userId,
          problemId,
          code,
          language,
          status:'pending',
          testCasesTotal:problem.hiddenTestCases.length
        })


        const languageId = getLanguageById(language);

        const submissions = problem.hiddenTestCases.map((testcase)=>({
        source_code:code,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output
      }));

      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value)=> value.token);

      const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;

    for(const test of testResult){
        if(test.status_id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
          if(test.status_id==4){
            status = 'error'
            errorMessage = test.stderr
          }
          else{
            status = 'wrong'
            errorMessage = test.stderr
          }
        }
    }
     
    submittedResult.status   = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    //problem ko insert karenge userSchema ke problemSolved mai if it is not present there
    //req.result == user Information

    if(!req.result.problemSolved.includes(problemId)){
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    res.status(201).send(submittedResult);


    }

    catch(err){
        res.status(500).send("Error in submission:"+ err);
    }

}



*/

const runCode = async(req,res)=>{
    
     // 
     try{
      const userId = req.result._id;
      const problemId = req.params.id;

      const {code,language} = req.body;

     if(!userId||!code||!problemId||!language)
       return res.status(400).json({
         success:false,
         message:"Some  fields Missing"
      })

   //    Fetch the problem from database
      const problem =  await Problem.findById(problemId);
   //    testcases(Hidden)


   //    Judge0 code ko submit karna hai

      const languageId = getLanguageById(language);

      const submissions = problem.visibleTestCases.map((testcase)=>({
          source_code: Buffer.from(code, "utf8").toString("base64"),
          language_id: languageId,
          stdin: Buffer.from(testcase.input, "utf8").toString("base64"),
          expected_output: Buffer.from(testcase.output, "utf8").toString("base64")
      }));
      


      const submitResult = await submitBatch(submissions);
   
      const resultToken = submitResult.map((value)=> value.token);

      const testResult = await submitToken(resultToken);
   

      const decodedResult = testResult.map((tc) => ({
            ...tc,

            stdout: decode(tc.stdout),
            stderr: decode(tc.stderr),
            compile_output: decode(tc.compile_output),
            stdin: decode(tc.stdin),
            expected_output: decode(tc.expected_output),
        }));
    



      const cleanResult = decodedResult.map((tc) => ({
        token: tc.token,
        stdin: tc.stdin,
        expected_output: tc.expected_output,
        stdout: tc.stdout,
        stderr: tc.stderr,
        compile_output: tc.compile_output,
        status_id: tc.status_id,        
        status: tc.status.description,  
        time: tc.time,
        memory: tc.memory
      }));

      


        const passedCases = cleanResult.filter(
          tc => tc.status_id === 3
        ).length;
        
        const firstFailedCase = cleanResult.find(
          tc => tc.status_id !== 3
      );

      if(firstFailedCase?.status==="Compilation Error"){

      return res.status(200).json({

          success:false,
          resultType:"Compilation Error",
          passedCases:0,
          totalCases:cleanResult.length,
          compileOutput:firstFailedCase.compile_output,
          testCases:cleanResult

      });

    }


  if(firstFailedCase?.status.startsWith("Runtime Error")){

    return res.status(200).json({

        passedCases:passedCases,
        totalCases:cleanResult.length,
        success:false,
        resultType:"Runtime Error",
        runtimeOutput:firstFailedCase.stderr,
        testCases:cleanResult

    });

  }
  


  if(passedCases!==cleanResult.length){

    return res.status(200).json({

        success:false,
        resultType:"Wrong Answer",
        passedCases,
        totalCases:cleanResult.length,
        testCases:cleanResult

    });

}




  res.status(200).send({
    resultType: "Accepted",
    success: passedCases === cleanResult.length,
    passedCases,
    totalCases: cleanResult.length,
    testCases: cleanResult
  });




   
   }
   catch(err){
     return res.status(500).json({
      success:false,
      message:"Internal Server Error"
   });
   }
}

module.exports={
  submitCode,
  runCode
}
//     language_id: 54,
//     stdin: '2 3',
//     expected_output: '5',
//     stdout: '5',
//     status_id: 3,
//     created_at: '2025-05-12T16:47:37.239Z',
//     finished_at: '2025-05-12T16:47:37.695Z',
//     time: '0.002',
//     memory: 904,
//     stderr: null,
//     token: '611405fa-4f31-44a6-99c8-6f407bc14e73',

/* 
What we did in the submitCode fucntion 
1.first we fetched the user id from req.result._id
2.secondly We fetched the ProblemId from the req.params
3.we retrieved code and language from the req.body
4.we checked whether userid,code,language,problemId if any of the field is missing
5.we fetched the problem from database
6.we created a submission with status pending on it 
7.languageId retrieve kiya 
8.ek batch banaya by looping on all the hidden testcases of the problem
9.iss batch ko submitBatch function mai as a parameter pass kiya
7.response mai token mila 
8.["...","...","...."] ek array of token banaya named as resultToken
9. iss resultToken ko submitToken fucntion mai pass kiya toh ek array of result aayega
in the form
[
{
  "language_id": 54,
  "stdin": "2 3",
  "expected_output": "5",
  "stdout": "5",
  "status_id": 3,
  "created_at": "2025-05-12T16:47:37.239Z",
  "finished_at": "2025-05-12T16:47:37.695Z",
  "time": "0.002",
  "memory": 904,
  "stderr": null,
  "token": "611405fa-4f31-44a6-99c8-6f407bc14e73"
},
{
  "language_id": 54,
  "stdin": "2 3",
  "expected_output": "5",
  "stdout": "5",
  "status_id": 3,
  "created_at": "2025-05-12T16:47:37.239Z",
  "finished_at": "2025-05-12T16:47:37.695Z",
  "time": "0.002",
  "memory": 904,
  "stderr": null,
  "token": "611405fa-4f31-44a6-99c8-6f407bc14e73"
}
  ]

10.humne kuch variables banaya like testcasesPassed,runtime,memory,status,errormessage
11.phir humne testResult pe loop kiya
aur agar koi test case pass ho gaya toh testcassesPassed pe true mark kar denge
runtime aur memory ko thik se update kardenge
12.agar kisi ki status_id==4 aagayi toh status mai error denge
nahi toh wrong answer denge
phir submittedResult.status,testCasespassed,errormessage,runtime,memory ko update karenge
aur save kar denge

*/
