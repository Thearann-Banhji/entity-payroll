'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.get = async (event, context) => {
  const table = process.env.item_table
  const params = {
    ExpressionAttributeValues: {
      ':sk': event.pathParameters.institute_id,
      ':pk': event.pathParameters.id
    },
    IndexName: 'GSI1',
    KeyConditionExpression: 'sk = :sk and pk = :pk',
    TableName: table
  }
  try {
    const data = await dynamoDb.query(params).promise()
    const results = data.Items.map(item => {
      return {
        id: item.pk,
        employeeId: item.employeeId ? item.employeeId : '',
        employeeType: item.employeeType ? item.employeeType : '',
        firstName: item.firstName ? item.firstName : '',
        lastName: item.lastName ? item.lastName : '',
        firstNameLocale: item.firstNameLocale ? item.firstNameLocale : '',
        lastNameLocale: item.lastNameLocale ? item.lastNameLocale : '',
        gender: item.gender ? item.gender : {},
        dob: item.dob ? item.dob : '',
        identityId: item.identityId ? item.identityId : '',
        identityType: item.identityType ? item.identityType : '',
        address: item.address ? item.address : '',
        phone: item.phone ? item.phone : '',
        email: item.email ? item.email : '',
        salaryAcc: item.salaryAcc ? item.salaryAcc : {},
        salaryAdvanceAcc: item.salaryAdvanceAcc ? item.salaryAdvanceAcc : '',
        image: item.image ? item.image : {},
        country: item.country ? item.country : {},
        nationality: item.nationality ? item.nationality : {},
        maritalStatus: item.maritalStatus ? item.maritalStatus : {},
        noOfChildren: item.noOfChildren ? item.noOfChildren : 0,
        bank: item.bank ? item.bank : {},
        bankAccount: item.bankAccount ? item.bankAccount : '',
        paymentPeriod: item.paymentPeriod ? item.paymentPeriod : {},
        status: item.status ? item.status : 0
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
      statusCode: code.httpStatus.Created,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.BadRequest, [], message.msg.FetchFailed, error, 0)
    }
  }
}
