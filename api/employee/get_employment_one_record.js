'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const uuid = require('uuid')
// const dynamoDb = new AWS.DynamoDB.DocumentClient()

const dynamoDb = require('../../config/dynamodb')

module.exports.getOne = async (event, context) => {
  // const table = process.env.item_table
  const table = 'entity-payroll-started-dev'
  const params = {
    TableName: table,
    // IndexName: 'GSI1',
    IndexName: 'pk-sk-index',
    KeyConditionExpression: 'SK = :SK AND PK = :PK',
    ExpressionAttributeValues: {
        ':SK': event.pathParameters.institute_id,
        ':PK': event.pathParameters.id,
    },
  }
  try {
    const data = await dynamoDb.query(params).promise()
    const results = data.Items.map(item => {
      return {
        id:               item.PK,
        employmentRecord: item.employmentRecord,
        status:           item.status,
        employee:         item.employee,
        benefit:          item.benefit,
        location:         item.location,
        natureContract:   item.natureContract,
        salary:           item.salary,
        workDay:          item.workDay,
        startingTime:     item.startingTime,
        overTime:         item.overTime,
        salaryType:       item.salaryType,
        natureRecord:     item.natureRecord,
        position:         item.position,
        natureSalary:     item.natureSalary,
        date:             item.date,
        applyOvertime:    item.applyOvertime
      }
    })
    return {
      statusCode: code.httpStatus.OK,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.OK, results, message.msg.FetchSuccessed, '', 1)
    }
  } catch (error) {
    return {
      statusCode: code.httpStatus.BadRequest,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.BadRequest, [], message.msg.FetchFailed, error, 0)
    }
  }
}
