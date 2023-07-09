"use strict";

const DynamoDB = require("aws-sdk/clients/dynamodb");
const dynamoDb = new DynamoDB.DocumentClient({ region: "ap-south-1" });
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

    await dynamoDb.put(params).promise();

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

    let result = await dynamoDb.update(params).promise();

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

    await dynamoDb.delete(params).promise();

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

    let result = await dynamoDb.scan(params).promise();

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
