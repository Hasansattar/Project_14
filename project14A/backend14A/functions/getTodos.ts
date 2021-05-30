// const AWS = require('aws-sdk');
// const docClient = new AWS.DynamoDB.DocumentClient();

// async function getTodos() {
//     const params = {
//         TableName: process.env.DYNAMO_TABLE_NAME,
//     }
//     try {
//         const data = await docClient.scan(params).promise()
//         return data.Items
//     } catch (err) {
//         console.log('DynamoDB error: ', err)
//         return null
//     }
// }

// export default getTodos;