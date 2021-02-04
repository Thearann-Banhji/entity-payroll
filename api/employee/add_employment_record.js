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
  const table = 'payroll-dev'
  const instituteId = event.pathParameters.institute_id

  let head = 'emr-' // supplier type

  if (data.id === undefined || data.id === '') {
    head = 'emr-' + uuid.v1()
  } else {
    head = data.id
  }
  const pk = head
  const paramsGet = {
    TableName: table,
    IndexName: 'GSI1',
    KeyConditionExpression: 'sk = :sk AND begins_with(pk, :type)',
    FilterExpression: '#status = :status',
    ExpressionAttributeValues: {
        ':sk': data.employee.id,
        ':type': 'emr-',
        ':status': 1
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  }
  let results = await dynamoDb.query(paramsGet).promise()
  if(results.Count > 0){
    let result_uuid = results.Items[0].pk
    var paramsUpdate = {
      TableName:table,
      Key:{
          PK: result_uuid,
          SK: data.employee.id
      },
      UpdateExpression: 'set #status = :status',
      ExpressionAttributeValues: {
        ':status': 0,
      },
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ReturnValues:"UPDATED_NEW"
    };
    await dynamoDb.update(paramsUpdate, function(err, data) {
      if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      }
    })
  }
  const history = {
    id: pk,
    employee: data.employee,
    natureRecord: data.natureRecord,
    date: data.date,
    location: data.location,
    natureContract: data.natureContract,
    salaryType: data.salaryType,
    salary: data.salary,
    benefit: data.benefit,
    workDay: data.workDay,
    startingTime: data.startingTime,
    overTime: data.overTime,
    position: data.position,
    status: data.status,
    natureSalary:   data.natureSalary,
    applyOvertime: data.applyOvertime
  }
  const params = [
    {
      PutRequest: { //  todo: supplier type
        Item: {
          sk:             instituteId,
          pk:             pk,
          employee:       data.employee,
          natureRecord:   data.natureRecord,
          date:           data.date,
          location:       data.location,
          natureContract: data.natureContract,
          salaryType:     data.salaryType,
          salary:         data.salary,
          benefit:        data.benefit,
          workDay:        data.workDay,
          startingTime:   data.startingTime,
          overTime:       data.overTime,
          position:       data.position,
          status:         data.status,
          natureSalary:   data.natureSalary,
          applyOvertime:  data.applyOvertime,
          createdAt:      timestamp,
          updatedAt:      timestamp,
        }
      }
    },
    {
      PutRequest: { //  todo: supplier type account receivable
        Item: {
          sk: data.employee.id,
          pk: pk,
          employmentRecord: history,
          status: data.status,
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
      id: pk,
      employee: data.employee,
      natureRecord: data.natureRecord,
      date: data.date,
      location: data.location,
      natureContract: data.natureContract,
      salaryType: data.salaryType,
      salary: data.salary,
      benefit: data.benefit,
      workDay: data.workDay,
      segment: data.segment,
      startingTime: data.startingTime,
      overTime: data.overTime,
      position: data.position,

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
