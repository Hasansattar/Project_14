import { EventBridgeEvent, Context } from "aws-lambda";
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
import { randomBytes } from "crypto";

exports.handler = async (event: EventBridgeEvent<string, any>) => {
  console.log(JSON.stringify(event, null, 2));

  try {
    if (event["detail-type"] === "addPet") {
      const params = {
        TableName: process.env.DYNAMO_TABLE_NAME,
        Item: { id: randomBytes(16).toString("hex"), ...event.detail },
      };

      await docClient.put(params).promise();
    } 
    else if (event["detail-type"] === "getPetTest") {
      const params = {
        TableName: process.env.DYNAMO_TABLE_NAME,
      };
      const data = await docClient.scan(params).promise();
      return data.Items;
    } else return null;
  } catch (error) {}
};
