import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as dynamoDB from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as eventsTargets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as sqs from '@aws-cdk/aws-sqs';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';

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


  }
}
