 
import { EventBridgeEvent, Context } from 'aws-lambda';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();



 
 


 
exports.handler = async (event: EventBridgeEvent<string,any>, context: Context) => {
    console.log(JSON.stringify(event, null, 2));

    try {
        if (event["detail-type"] === "addBookmark"){

               console.log("detail===>", JSON.stringify(event.detail, null, 2));
            
                const params = {
                    TableName: process.env.BOOKMARK_TABLE_NAME,
                    Item:  {...event.detail}
                }
                await docClient.put(params).promise();
                
            
        }

        else if (event["detail-type"] === "getBookmark"){
            const params = {
                TableName: process.env.BOOKMARK_TABLE_NAME,
            }             
                const data = await docClient.scan(params).promise()
                return data.Items
            
        }
        else if (event["detail-type"] === "deleteBookmark"){
                 console.log("detail===>", JSON.stringify(event.detail, null, 2));
            const params = {
                TableName: process.env.BOOKMARK_TABLE_NAME,
                Key:{ id: event.detail.id },
            }             
                  await docClient.delete(params).promise();
                  
            
        }

        
        else
        return null;
        
    } catch (error) {
        console.log(error)
        
    }
        
  
    
 
}