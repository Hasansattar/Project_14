import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import { Effect, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';

import {
  responseTemplate,
  requestTemplate,
  EVENT_SOURCE,
} from "../utils/appsync-request-response";
import * as stepFunctions from '@aws-cdk/aws-stepfunctions';
import * as stepFunctionsTasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as apigw from "@aws-cdk/aws-apigateway";

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "cdk-pet-appsync-api",
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

    const PetTable = new ddb.Table(this, "CDKPetTable", {
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING,
      },
    });

    const PETDATASOURCE = api.addDynamoDbDataSource("DATASOURCE", PetTable);

    PETDATASOURCE.createResolver({
      typeName: "Query",
      fieldName: "getPetTest",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    const mutations = ["addPet"];

    mutations.forEach((mut) => {
      let details = `\\\"id\\\": \\\"$ctx.args.id\\\"`;

      if (mut === "addPet") {
        details = `\\\"name\\\":\\\"$ctx.args.pet.name\\\", \\\"report\\\":\\\"$ctx.args.pet.report\\\"`;
      }
      httpDs.createResolver({
        typeName: "Mutation",
        fieldName: mut,
        requestMappingTemplate: appsync.MappingTemplate.fromString(
          requestTemplate(details, mut)
        ),
        responseMappingTemplate: appsync.MappingTemplate.fromString(
          responseTemplate()
        ),
      });
    });

    const petLambda = new lambda.Function(this, "AppSyncNotesHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: lambda.Code.fromAsset("functions"),

      environment: {
        DYNAMO_TABLE_NAME: PetTable.tableName,
      },
    });

    PetTable.grantReadWriteData(petLambda);
    // todosLambda.addEnvironment("TODOS_TABLE", todosTable.tableName);

   
      // Creating a IAM role for lambda to give access of ses send email
      const role = new Role(this, 'LambdaRole', {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      });

       ///Attaching ses access to policy
    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["ses:SendEmail", "ses:SendRawEmail", "logs:*"],
      resources: ['*']
    });

 //granting IAM permissions to role
 role.addToPolicy(policy);

    const emailSender = new lambda.Function(this, "HandleSendEmail", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "ses.handler",
      role: role,
      // environment:{
      //   SES_TOPIC_ARN:
      // }
    })

        //////////////// Creating Steps of StepFunctions //////////////////////////
    /* Step 1 */
    const firstStep = new stepFunctionsTasks.LambdaInvoke(this, "Dynamo_Handler_Lambda",              //15
    { lambdaFunction: petLambda, }
  );

  const secondStep = new stepFunctionsTasks.LambdaInvoke(this, "SES_Hanlder_Lambda", {
    lambdaFunction: emailSender,
  //  inputPath: "$.Payload"
  })

    // creating chain to define the sequence of execution
    const stf_chain = stepFunctions.Chain
      .start(firstStep)
      .next(secondStep);

    // create a state machine
    const stateMachine = new stepFunctions.StateMachine(this, 'StateMachine',
      {
        definition: stf_chain
      })



    // RULE ON DEFAULT EVENT BUS TO TARGET ECHO LAMBDA
    const rule = new events.Rule(this, "AppSyncEventBridgeRule", {
      eventPattern: {
        source: [EVENT_SOURCE], // every event that has source = "eru-appsync-events" will be sent to our echo lambda
        detailType: [...mutations],
      },
    });
    rule.addTarget(new targets.SfnStateMachine(stateMachine));

          
      //  // create the API Gateway with one method and path For lambda
      //  const gw = new apigw.RestApi(this, "SendEmailEndPoint")
      //  gw
      //    .root
      //    .resourceForPath("sendmail")
      //    .addMethod("POST", new apigw.LambdaIntegration(emailSender))
   
   
      //  // logging api endpoint
      //  new cdk.CfnOutput(this, 'Send email endpoint', {
      //    value: `${gw.url}sendmail`
      //  });

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
