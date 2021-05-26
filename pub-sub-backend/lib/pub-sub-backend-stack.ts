import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as dynamoDB from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as sqs from '@aws-cdk/aws-sqs';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import { responseTemplate, requestTemplate, EVENT_SOURCE } from '../utils/appsync-request-response';

export class PubSubBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    /// APPSYNC API gives you a graphql api with api key
    const petTheoryApi = new appsync.GraphqlApi(this, 'pet-theory-system', {
      name: 'appsyncPettheorysystem',
      schema: appsync.Schema.fromAsset('utils/schema.gql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY
        }
      }
    });

    // Create new AWS DynamoDB Table for pet-theory-system
    const PetTheoryTable = new dynamoDB.Table(this, 'pet-theory-table', {
      tableName: 'PetTable',
      partitionKey: {
        name: 'id',
        type: dynamoDB.AttributeType.STRING,
      },
    });

     ///Attaching Datasource to api
    const PetTheoryDS = petTheoryApi.addDynamoDbDataSource('pet-theoryTableEvent', PetTheoryTable);

    const dynamoHandlerLambda = new lambda.Function(this, 'Dynamo_Handler', {
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'dynamoHandler.handler',
      environment: {
        DYNAMO_TABLE_NAME: PetTheoryTable.tableName,
      },
    });

    // HTTP as Datasource for the Graphql API
    //// Create Http Data source that will put our event to the eventbus    
    const httpEventTriggerDS = petTheoryApi.addHttpDataSource(
      "eventTriggerDS",
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

    events.EventBus.grantAllPutEvents(httpEventTriggerDS);

    ///////////////  APPSYNC  Resolvers   ///////////////

    /* Query */
    PetTheoryDS.createResolver({
      typeName: "Query",
      fieldName: "getReports",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    /* Mutation */
    const mutations = ["addReport", "deleteReport"]
    mutations.forEach((mut) => {
      let details = `\\\"todoId\\\": \\\"$ctx.args.todoId\\\"`;
      if (mut === 'addReport') {
        details = `\\\"firstName\\\":\\\"$ctx.args.report.firstName\\\" , \\\"lastName\\\":\\\"$ctx.args.report.lastName\\\" , \\\"reportTitle\\\":\\\"$ctx.args.report.reportTitle\\\" , \\\"desc\\\":\\\"$ctx.args.report.desc\\\"`
      } else if (mut === "deleteReport") {
        details = `\\\"reportId\\\":\\\"$ctx.args.reportId\\\"`
      }

      httpEventTriggerDS.createResolver({
        typeName: "Mutation",
        fieldName: mut,
        requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details, mut)),
        responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
      });
    });


    

  }
}
