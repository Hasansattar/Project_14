// const AWS = require('aws-sdk');
// const docClient = new AWS.DynamoDB.DocumentClient();
// import Todo from './Todo';

// async function addTodo(todo: Todo) {
//     const params = {
//         TableName: process.env.DYNAMO_TABLE_NAME,
//         Item: todo
//     }
//     try {
//         await docClient.put(params).promise();
//         return todo;
//     } catch (err) {
//         console.log('DynamoDB error: ', err);
//         return null;
//     }
// }

// export default addTodo;