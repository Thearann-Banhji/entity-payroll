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

  // const table = process.env.item_table
  const table = 'entity-payroll-started-dev'
  const instituteId = event.pathParameters.institute_id

  let head = 'tim-' // supplier type

  if (data.id === undefined || data.id === '') {
    head = 'tim-' + uuid.v1()
  } else {
    head = data.id
  }
  const PK = head
  const history = {
    id: PK,
    employee: data.employee,
    monthOf: data.monthOf,
    location: data.location,
    timeSheetRecord: data.timeSheetRecord,
    totalHours:       data.totalHours,
    paidHours:         data.paidHours,
    unpaidHours:       data.unpaidHours,
    overtimeHoursWeekend: data.overtimeHoursWeekend,
    overtimeHoursHoliday: data.overtimeHoursHoliday,
}
  const params = [
    {
      PutRequest: { //  todo: supplier type
        Item: {
            SK:                 instituteId,
            PK:                 PK,
            employee:           data.employee,
            monthOf:            data.monthOf,
            location:           data.location,
            timeSheetRecord:    data.timeSheetRecord,
            totalHours:       data.totalHours,
            paidHours:         data.paidHours,
            unpaidHours:       data.unpaidHours,
            overtimeHoursWeekend: data.overtimeHoursWeekend,
            overtimeHoursHoliday: data.overtimeHoursHoliday,
            createdAt:          timestamp,
            updatedAt:          timestamp,
        }
      }
    },
    {
      PutRequest: { //  todo: supplier type account receivable
        Item: {
          SK: data.employee.id,
          PK: PK,
          timesheetRecord: history,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
    }
  ]
  // console.log('Param : ' + JSON.stringify(params))
  //  todo: write to the database
  try {
    await dynamoDb
      .batchWrite({
        RequestItems: {
          [table]: params
        }
      })
      .promise()
    // console.log('item created ' + item)
    // response back
    const response = {
      id: PK,
      employee:           data.employee,
      monthOf:            data.monthOf,
      location:           data.location,
      timeSheetRecord:    data.timeSheetRecord,
      totalHours:         data.totalHours,
      ppaidHours:         data.paidHours,
      unpaidHours:       data.unpaidHours,
      overtimeHoursWeekend: data.overtimeHoursWeekend,
      overtimeHoursHoliday: data.overtimeHoursHoliday,
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
