import * as cdk from '@aws-cdk/core';
import * as appsync from "@aws-cdk/aws-appsync";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import {responseTemplate ,requestTemplate ,EVENT_SOURCE} from "../appsync-request-response"

export class Backend14BStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const api = new appsync.GraphqlApi(this, "Api", {
      name: "cdk-book-appsync-api",
      schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
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

    const bookmarkTable = new ddb.Table(this, "CDKBookTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    const BOOKSOURCE = api.addDynamoDbDataSource("DATASOURCE", bookmarkTable);

    BOOKSOURCE.createResolver({
      typeName: "Query",
      fieldName: "getBookmark",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });


      const mutations =["addBookmark", "deleteBookmark",]

      mutations.forEach((mut)=>{
        let details = `\\\"id\\\": \\\"$ctx.args.id\\\"`;

        if(mut === 'addBookmark'){
          details = `\\\"id\\\":\\\"$ctx.args.bookmarks.id\\\",\\\"title\\\":\\\"$ctx.args.bookmarks.title\\\", \\\"url\\\":\\\"$ctx.args.bookmarks.url\\\"`
        }
       
        httpDs.createResolver({
          typeName: "Mutation" ,
          fieldName: mut,
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });
    
      });

    
    const bookmarkLambda = new lambda.Function(this, "AppSyncNotesHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("functions"),

      environment: {
        BOOKMARK_TABLE_NAME: bookmarkTable.tableName,
      },
    });

    bookmarkTable.grantFullAccess(bookmarkLambda);
   // todosLambda.addEnvironment("TODOS_TABLE", todosTable.tableName);

    // RULE ON DEFAULT EVENT BUS TO TARGET ECHO LAMBDA
    const rule = new events.Rule(this, "AppSyncEventBridgeRule", {
      eventPattern: {
        source: [EVENT_SOURCE], // every event that has source = "eru-appsync-events" will be sent to our echo lambda
         detailType: [...mutations,],
      },
    });
    rule.addTarget(new targets.LambdaFunction(bookmarkLambda));

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
