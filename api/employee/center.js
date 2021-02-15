'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')

// const dynamoDb = new AWS.DynamoDB.DocumentClient()
const dynamoDb = require('../../config/dynamodb')

module.exports.gets = async (event, context) => {
  // const table = process.env.item_table
  const table = 'payroll-dev'
  const search = event.pathParameters.search
  let params = ''
  let data = []
  const results = []
  if (search) {
    params = {
      ExpressionAttributeValues: {
        ':sk': event.pathParameters.institute_id,
        ':type': 'emp-',
        ':search': search,
        ':searchL': search.toLowerCase(),
        ':searchU': search.toUpperCase(),
        ':searchF': search.charAt(0).toUpperCase() + search.slice(1),
        ':searchFL': search.charAt(0).toLowerCase() + search.slice(1)
      },
      ExpressionAttributeNames: {
        '#employeeId': 'employeeId',
        '#identityId': 'identityId',
        '#firstName': 'firstName',
        '#firstNameLocale': 'firstNameLocale',
        '#lastName': 'lastName',
        '#lastNameLocale': 'lastNameLocale',
        '#email': 'email',
        '#phone': 'phone'
      },
      IndexName: 'GSI1',
      KeyConditionExpression: 'sk = :sk and begins_with(pk, :type)',
      FilterExpression: 'contains (#employeeId, :searchFL) ' +
        'or contains (#employeeId, :searchF) ' +
        'or contains (#employeeId, :search) ' +
        'or contains (#identityId, :search) ' +
        'or contains (#identityId, :searchL) ' +
        'or contains (#identityId, :searchU) ' +
        'or contains (#identityId, :searchFL) ' +
        'or contains (#employeeId, :search) ' +
        'or contains (#firstName, :search) ' +
        'or contains (#firstName, :searchL) ' +
        'or contains (#firstName, :searchU) ' +
        'or contains (#firstName, :searchFL) ' +
        'or contains (#firstName, :searchL) ' +
        'or contains (#email, :search) ' +
        'or contains (#email, :searchL) ' +
        'or contains (#email, :searchU) ' +
        'or contains (#email, :searchF) ' +
        'or contains (#email, :searchFL) ' +
        'or contains (#phone, :search) ' +
        'or contains (#phone, :searchL) ' +
        'or contains (#phone, :searchF) ' +
        'or contains (#phone, :searchFL) ' +
        'or contains (#phone, :searchU) ' +
        'or contains (#lastName, :search) ' +
        'or contains (#lastName, :searchL) ' +
        'or contains (#lastName, :searchF) ' +
        'or contains (#lastName, :searchU) ' +
        'or contains (#lastName, :searchFL) ' +
        'or contains (#lastNameLocale, :search) ' +
        'or contains (#lastNameLocale, :searchL) ' +
        'or contains (#lastNameLocale, :searchF) ' +
        'or contains (#lastNameLocale, :searchFL) ' +
        'or contains (#lastNameLocale, :searchU) ' +
        'or contains (#firstNameLocale, :search) ' +
        'or contains (#firstNameLocale, :searchL) ' +
        'or contains (#firstNameLocale, :searchF) ' +
        'or contains (#firstNameLocale, :searchFL) ' +
        'or contains (#firstNameLocale, :searchU) ' +
        'or contains (#employeeId, :searchU)',
      TableName: table
    }
  } else {
    params = {
      ExpressionAttributeValues: {
        ':sk': event.pathParameters.institute_id,
        ':type': 'emp-'
      },
      IndexName: 'GSI1',
      KeyConditionExpression: 'sk = :sk and begins_with(pk, :type)',
      TableName: table
    }
  }
  data = await dynamoDb.query(params).promise()
  data.Items.map(item => {
    results.push({
      id: item.pk,
      name: (item.employeeId ? item.employeeId : '') + ' - ' + (item.firstName ? item.firstName : '') + ' ' + (item.lastName ? item.lastName : ''),
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
      payrollLiabilitie: item.payrollLiabilitie ? item.payrollLiabilitie: '',
      image: item.image ? item.image : {},
      country: item.country ? item.country : {},
      nationality: item.nationality ? item.nationality : {},
      maritalStatus: item.maritalStatus ? item.maritalStatus : {},
      noOfChildren: item.noOfChildren ? item.noOfChildren : 0,
      bank: item.bank ? item.bank : {},
      bankAccount: item.bankAccount ? item.bankAccount : '',
      paymentPeriod: item.paymentPeriod ? item.paymentPeriod : {},
      status: item.status ? item.status : 0,
      createdAt: item.createdAt ? item.createdAt : ''
    })
  })
  const sortedData = results.sort(function (a, b) {
    return Date.parse(b.createdAt) - Date.parse(a.createdAt)
  })

  try {
    return {
      statusCode: code.httpStatus.OK,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // to allow cross origin access
      },
      body: json.responseBody(code.httpStatus.OK, sortedData, message.msg.FetchSuccessed, '', 1)
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
