import { EventBridgeEvent, Context } from 'aws-lambda';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

 
exports.handler = async (event: EventBridgeEvent<string,any>, context: Context) => {
    console.log(JSON.stringify(event, null, 2));

    try {
        if (event["detail-type"] === "addLolly"){

               console.log("detail===>", JSON.stringify(event.detail, null, 2));
            
                const params = {
                    TableName: process.env.LOLLY_TABLE_NAME,
                    Item:  {...event.detail}
                }
                await docClient.put(params).promise();
                
            
        }

        else if (event["detail-type"] === "getLolly"){
            const params = {
                TableName: process.env.LOLLY_TABLE_NAME,
            }             
                const data = await docClient.scan(params).promise()
                return data.Items
            
        }
        
        
        else
        return null;
        
    } catch (error) {
        console.log(error)
        
    }
        
  
    
 
}