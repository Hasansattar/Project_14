
import {APIGatewayProxyEvent , APIGatewayProxyResult, Context} from 'aws-lambda'
import {SES} from 'aws-sdk'


const ses=new SES();

exports.handler=async(event:APIGatewayProxyEvent, context:Context)=>{
    console.log("Request ===>", event.body);


    const params={
        Destination:{
            ToAddresses:["hasansattar650@gmail.com"],
        },
        Message:{
            Body:{
                Text:{ Data: "your pet report is normal" },
                
            },
            Subject:{ Data: "HELLO"},   
         },
         Source:"hasansattar66@gmail.com",  
    }

    try {
         await ses.sendEmail(params).promise();
        
    } catch (error) {
        console.log('error sending email', error)
        
        
    }


}

