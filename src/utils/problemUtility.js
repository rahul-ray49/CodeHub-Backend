const axios = require('axios');


const getLanguageById = (lang)=>{

    const language = {
        "c++":54,
        "java":62,
        "javascript":63
    }


    return language[lang.toLowerCase()];
}


const submitBatch = async (submissions)=>{


const options = {
  method: 'POST',
  url: 'https://ce.judge0.com/submissions/batch',
  params: {
    base64_encoded: 'true'
  },
  headers: {
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error("submit batch error occured"+error);
        throw error;
    }
}

 return await fetchData();



}


const waiting =async(timer)=>{
  setTimeout(()=>{
    return 1;
  },timer)
}


const submitToken=async(resultToken)=>{
  const options = {
    method: 'GET',
    url: 'https://ce.judge0.com/submissions/batch',
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'true',
      fields:"token,stdin,expected_output,stdout,stderr,compile_output,status_id,status,time,memory"
    },
    headers: {
      
    }
  };
  
  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
       console.log("Status:", error.response?.status);
        console.log("Data:", error.response?.data);
        console.log("Message:", error.message);
    }
  }
  
  
   while(true){
  
   const result =  await fetchData();
   
  
    const IsResultObtained =  result.submissions.every((r)=>r.status_id>2);
  
    if(IsResultObtained)
      return result.submissions;
  
    
    await waiting(1000);
  }
}


module.exports={getLanguageById,submitBatch,submitToken};




/*const waiting =async(timer)=>{
  setTimeout(()=>{
    return 1;
  },timer)
}
**This function basically provides the waiting time for 1 second
ye tab jaruri hota hai jab token ki status ki id 1 ya 2 hti hai
token ki id status basically jab 1 ya 2 hooti hai tab ska matlab hai ki code
abhi queue mai lagi hai aur execute nahi hui hai
ek baar jab staatus ki id greater than 2 aagayi tab jaake hum kisi conclusion mai pahunch sakte hai
*/


/*const getLanguageById = (lang)=>{

    const language = {
        "c++":54,
        "java":62,
        "javascript":63
    }


    return language[lang.toLowerCase()];
}
1.ye code basically ek string lang ki form mai leta hai aur language object mai se 
uss corresponding language ka language id return karega
*/


/*const submitBatch = async (submissions)=>{

const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': 'ab99c6ec42mshfd636ec7c6687efp1b9043jsna684835b0591',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};
async function fetchData() {
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

 return await fetchData();
}
2.jab humne batch bana liya toh abb humne ek submitBatch naam ka function banaya
3.ye function ek batch ko as a argument leta hai
4.iss function ka kaam hai batch ko lena usse judge0 ke api ko dena aur 
5.ek option naam ka object humne banaya jismein humne data key mai batch ko submit kiya
6.uss submit batch ke andar humne ek fetchData naam ka function banaya 
7.iss fetchData fucntion mai humne axios ke through api ko call kiya
aur ye entire thing ek array of token laake dega jisse 
judge0 ne as a response bheja hoga
*/

/*const submitToken=async(resultToken)=>{
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
    params: {
      tokens: resultToken.join(","),
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': 'ab99c6ec42mshfd636ec7c6687efp1b9043jsna684835b0591',
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };
  
  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
  
  
   while(true){
  
   const result =  await fetchData();
  
    const IsResultObtained =  result.submissions.every((r)=>r.status_id>2);
  
    if(IsResultObtained)
      return result.submissions;
  
    
    await waiting(1000);
  }
}

ye submit token same he kaam karta hai as submitBatch() fucntion ke jaisa
params: {
      tokens: resultToken.join(","),
      base64_encoded: 'false',
      fields: '*'
    },
toh submitBatch humne ek array of tokens deta hai in the form
[{token:"..."},{token:"..."},{token:"..."}];

humne externally iss array ko change karke bas ek array create karte hai
in the form ["...","...","..."]  aur iss array k as a parameter dete hai
in the submitToken function

aur params:{
tokens:resulltToken.join(",");
}
basically ye tokens ko comma seperated ke form mai join karke leta hai


while(true){
const result=fetchData();
ko call kiya gaya 
isse hum tak tak call karenge jab tak humare response mai jitni
bhi status id hai unki value more than 2 nah ho jaati

}





*/