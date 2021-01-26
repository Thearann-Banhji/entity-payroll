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
  let head = 'par-' // payroll bank
  if (data.id === undefined || data.id === '') {
    head = 'par-' + uuid.v1()
  } else {
    head = data.id
  }
  if(data.final ==='done'){
    const params = {
      TableName: table,
      Key: {
        PK: data.id,
        SK: event.pathParameters.institute_id
      },
      ExpressionAttributeValues: {
        ':runPayroll': data.runPayroll,
      },
      ExpressionAttributeNames: {
        '#runPayroll': 'runPayroll',
      },
      UpdateExpression: 'set #runPayroll = :runPayroll',
      ReturnValues: 'UPDATED_NEW'
    }
    try {
      await dynamoDb.update(params).promise()
      // response back
      const responseUpdate = {
          runPayroll: data.runPayroll
      }
      return {
        statusCode: code.httpStatus.Created,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // to allow cross origin access
        },
        body: json.responseBody(code.httpStatus.Created, responseUpdate, message.msg.ItemCreatedSuccessed, '', 1)
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
  }else{
    const PK = head
    const params = {
      TableName: table,
        Item: {
          PK: PK,
          SK: instituteId,
          monthOf:            data.monthOf,
          payrollList:        data.payrollList,
          totalEmployee:      data.totalEmployee,
          totalGross:         data.totalGross,
          totalBenefits:      data.totalBenefits,
          totalTaxBenefit:    data.totalTaxBenefit,
          totalNetPay:        data.totalNetPay,
          totalNetSalary:     data.totalNetSalary,
          totalDeduction:     data.totalDeduction,
          totalTaxPaymentUS:  data.totalTaxPaymentUS,
          totalTaxPaymentKHM: data.totalTaxPaymentKHM,
          step:               data.step,
          createdAt:          timestamp,
          updatedAt:          timestamp,
        }
    };
    try {
      await dynamoDb
        .put( params)
        .promise()
      // response back
      const response = {
          id: PK,
          monthOf:            data.monthOf,
          payrollList:        data.payrollList,
          totalEmployee:      data.totalEmployee,
          totalGross:         data.totalGross,
          totalBenefits:      data.totalBenefits,
          totalTaxBenefit:    data.totalTaxBenefit,
          totalNetPay:        data.totalNetPay,
          totalNetSalary:     data.totalNetSalary,
          totalDeduction:     data.totalDeduction,
          totalTaxPaymentUS:  data.totalTaxPaymentUS,
          totalTaxPaymentKHM: data.totalTaxPaymentKHM,
          step:               data.step,
          runPayroll:         data.runPayroll
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
}
