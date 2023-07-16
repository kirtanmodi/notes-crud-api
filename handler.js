"use strict";

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  DynamoDBDocumentClient,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

module.exports.createNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;

  let data = JSON.parse(event.body);

  try {
    let params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        content: data.content,
      },
      ConditionExpression: "attribute_not_exists(notesId)",
    };

    await ddbDocClient.send(new PutCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

module.exports.updateNote = async (event) => {
  let noteId = event.pathParameters.id;
  let data = JSON.parse(event.body);

  try {
    let params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId: noteId,
      },
      UpdateExpression: "set #title = :title, #content = :content",
      ExpressionAttributeNames: {
        "#title": "title",
        "#content": "content",
      },
      ExpressionAttributeValues: {
        ":title": data.title || null,
        ":content": data.content || null,
      },
      ConditionExpression: "attribute_exists(notesId)",
    };

    let result = await ddbDocClient.send(new UpdateCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

module.exports.deleteNote = async (event) => {
  let noteId = event.pathParameters.id;

  try {
    let params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId: noteId,
      },
      ConditionExpression: "attribute_exists(notesId)",
    };

    await ddbDocClient.send(new DeleteCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(`note ${noteId} deleted`),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

module.exports.getNotes = async (event) => {
  try {
    let params = {
      TableName: NOTES_TABLE_NAME,
    };

    let result = await ddbDocClient.send(new ScanCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};
