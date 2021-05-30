import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
 import {responseTemplate ,requestTemplate ,EVENT_SOURCE} from "../appsync-request-response"
// import * as apigateway from "@aws-cdk/aws-apigateway";
// import * as path from "path";

export class Backend14AStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const api = new appsync.GraphqlApi(this, "Api", {
      name: "cdk-todos-appsync-api",
      schema: appsync.Schema.fromAsset("schema/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
      xrayEnabled: true,
    });

    // HTTP DATASOURCE
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com/", // This is the ENDPOINT for eventbridge.
      {
        name: "httpDsWithEventBridge",
        description: "From Appsync to Eventbridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      }
    );
    events.EventBus.grantAllPutEvents(httpDs);

    const todosTable = new ddb.Table(this, "CDKTodosTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    const TODODARASOURCE = api.addDynamoDbDataSource("DATASOURCE", todosTable);

    TODODARASOURCE.createResolver({
      typeName: "Query",
      fieldName: "getTodos",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });


      const mutations =["addTodo"];

      mutations.forEach((mut)=>{
        let details = `\\\"id\\\": \\\"$ctx.args.id\\\"`;

        if(mut === 'addTodo'){
          details = `\\\"id\\\":\\\"$ctx.args.todo.id\\\",\\\"title\\\":\\\"$ctx.args.todo.title\\\", \\\"done\\\":\\\"$ctx.args.todo.done\\\"`
        }
        httpDs.createResolver({
          typeName: "Mutation" ,
          fieldName: mut,
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });
    
      });

    
    const todosLambda = new lambda.Function(this, "AppSyncNotesHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: lambda.Code.fromAsset("functions"),

      environment: {
        DYNAMO_TABLE_NAME: todosTable.tableName,
      },
    });

    todosTable.grantReadWriteData(todosLambda);
   // todosLambda.addEnvironment("TODOS_TABLE", todosTable.tableName);

    // RULE ON DEFAULT EVENT BUS TO TARGET ECHO LAMBDA
    const rule = new events.Rule(this, "AppSyncEventBridgeRule", {
      eventPattern: {
        source: [EVENT_SOURCE], // every event that has source = "eru-appsync-events" will be sent to our echo lambda
         detailType: [...mutations,],
      },
    });
    rule.addTarget(new targets.LambdaFunction(todosLambda));

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || "",
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region,
    });
  }
}
