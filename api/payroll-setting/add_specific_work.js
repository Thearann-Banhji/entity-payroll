'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const uuid = require('uuid')
// const dynamoDb = new AWS.DynamoDB.DocumentClient()

const dynamoDb = require('../../config/dynamodb')

module.exports.index = async (event) => {
  const timestamp = new Date().toJSON()
  const data = JSON.parse(event.body)
//   const table = process.env.item_table
  const table = 'entity-payroll-started-dev'
  const instituteId = event.pathParameters.institute_id
  let head = 'sfw-' // payroll bank

  if (data.id === undefined || data.id === '') {
    head = 'sfw-' + uuid.v1()
  } else {
    head = data.id
  }
  const PK = head
  const history = {
    id: PK,
    name: data.name,
    typeOfWork: data.typeOfWork,
    nature: data.nature
  }
  const params = [
    {
      PutRequest: { //  todo: supplier type
        Item: {
          PK: PK,
          SK: instituteId,
          name: data.name,
          typeOfWork: data.typeOfWork,
          nature:     data.nature,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
    },
    {
      PutRequest: { //  todo: supplier type account receivable
        Item: {
          SK: data.typeOfWork.id,
          PK: PK,
          specificWork: history,
        }
      }
    }
  ]
  //  todo: write to the database
  try {
    await dynamoDb
      .batchWrite({
        RequestItems: {
          [table]: params
        }
      })
      .promise()
    // response back
    const response = {
      id: PK,
      name: data.name,
      typeOfWork: data.typeOfWork,
    }

    return {
      statusCode: code.httpStatus.Created,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.Created, response, message.msg.ItemCreatedSuccessed, '', 1)
    }
  } catch (err) {
    return {
      statusCode: code.httpStatus.BadRequest,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.BadRequest, [], message.msg.ItemCreatedFailed, err, 0)
    }
  }
}
