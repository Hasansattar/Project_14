// import addTodo from './addTodo';
// import getTodos from './getTodos';
// import Todo from './Todo';
import { EventBridgeEvent, Context } from 'aws-lambda';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
import { randomBytes } from 'crypto';
import { title } from 'process';

// type AppSyncEvent = {
//     info: {
//         fieldName: string
//     },
//     arguments: {
       
//         todo: Todo
//     }
// }
 


 
exports.handler = async (event: EventBridgeEvent<string,any>, context: Context) => {
    console.log(JSON.stringify(event, null, 2));

    try {
        if (event["detail-type"] === "addTodo"){

           
            
                const params = {
                    TableName: process.env.DYNAMO_TABLE_NAME,
                    Item:  {...event.detail}
                }
                await docClient.put(params).promise();
                
            
        }

        else if (event["detail-type"] === "getTodos"){
            const params = {
                TableName: process.env.DYNAMO_TABLE_NAME,
            }             
                const data = await docClient.scan(params).promise()
                return data.Items
            
        }
        else
        return null;
        
    } catch (error) {
        console.log(error)
        
    }
        
  
    

    // switch (event.info.fieldName) {

    //     case "addTodo":
    //         return await addTodo(event.arguments.todo);
    //     case "getTodos":
    //         return await getTodos();
         
    //     default:
    //         return null;
    // }
}