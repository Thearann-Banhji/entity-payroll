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
  let types = ''
  if(event.queryStringParameters.selectTime =='Timecard')
    types = 'tcd-'
  else
    types = 'tim-'
  const params = {
    TableName: table,
    IndexName: 'GSI1',
    KeyConditionExpression: 'sk = :sk AND begins_with(pk, :type)',
    FilterExpression: 'monthOf = :monthOf',
    ExpressionAttributeValues: {
        ':sk': event.pathParameters.institute_id,
        ':type': types,
        ':monthOf': event.queryStringParameters.monthOf,
    },
  }
  try {
    const data = await dynamoDb.query(params).promise()
    const results = data.Items.map(item => {
      return {
        id:                   item.pk,
        monthOf:              item.monthOf,
        timeCardLine:         item.timeCardLine,
        totalWork:            item.totalWork,
        totalOverTimeWeekend: item.totalOverTimeWeekend,
        totalOverTimeHoliday: item.totalOverTimeHoliday,
        location:             item.location,
        segment:              item.segment,
        locationId:           item.locationId,
        segmentId:            item.segmentId,
        timeSheetRecord:      item.timeSheetRecord,
        totalHours:           item.totalHours,
        totalHoursBytype:     item.totalHoursBytype,
        paidHours:            item.paidHours,
        unpaidHours:          item.unpaidHours,
        overtimeHoursWeekend: item.overtimeHoursWeekend,
        overtimeHoursHoliday: item.overtimeHoursHoliday,
        employee:             item.employee,
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
