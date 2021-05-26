import { EventBridgeEvent, Context } from 'aws-lambda';
import * as AWS from 'aws-sdk';
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMO_TABLE_NAME as string;

export const handler = async (event: EventBridgeEvent<string, any>, context: Context) => {
    console.log(JSON.stringify(event, null, 2));
    try {
        //////////////  adding new report /////////////////////////
        if (event["detail-type"] === "addReport") {
            const params = {
                TableName: TABLE_NAME,
                Item: { id: Math.random(), ...event.detail },
            }
            await dynamoClient.put(params).promise();
        }
        //////////////  deleting report /////////////////////////
        else if (event["detail-type"] === "deleteReport") {
            const params = {
                TableName: TABLE_NAME,
                Key: { id: event.detail.reportId },
            }
            await dynamoClient.delete(params).promise();
        }
    } catch (error) {
        console.log("ERROR ====>", error);
    }
};