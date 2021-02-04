'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
// const dynamoDb = new AWS.DynamoDB.DocumentClient()

const dynamoDb = require('../../config/dynamodb')

module.exports.get = async (event, context) => {
  // const table = process.env.item_table
  const table = 'payroll-dev'
  const params = {
    TableName: table,
    IndexName: 'GSI1',
    KeyConditionExpression: 'sk = :sk AND begins_with(pk, :type) ',
    FilterExpression: '#status = :status',
    ExpressionAttributeValues: {
        ':sk': event.pathParameters.institute_id,
        ':type': 'emr-',
        ':status': 1
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  }
  try {
    const data = await dynamoDb.query(params).promise()
    const results = data.Items.map(item => {
      return {
        id:             item.pk,
        status:         item.status,
        salary:         item.salary,
        employee_id:    item.employee.id,
        employeeId:     item.employee.employeeId,
        employee:       item.employee,
        natureRecord:   item.natureRecord,
        date:           item.date,
        location:       item.location,
        natureContract: item.natureContract,
        salaryType:     item.salaryType,
        benefit:        item.benefit,
        workDay:        item.workDay,
        startingTime:   item.startingTime,
        overTime:       item.overTime,
        position:       item.position,
        status:         item.status,
        natureSalary:   item.natureSalary,
        applyOvertime:  item.applyOvertime
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
