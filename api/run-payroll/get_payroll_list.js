'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const uuid = require('uuid')
// const dynamoDb = new AWS.DynamoDB.DocumentClient()

const dynamoDb = require('../../config/dynamodb')

module.exports.get = async (event, context) => {
  // const table = process.env.item_table
  const table = 'payroll-dev'
  const params = {
    TableName: table,
    IndexName: 'GSI1',
    KeyConditionExpression: 'sk = :sk AND begins_with(pk, :type)',
    ExpressionAttributeValues: {
        ':sk': event.pathParameters.institute_id,
        ':type': 'par-',
    },
  }
  try {
    const data = await dynamoDb.query(params).promise()
    const results = data.Items.map(item => {
      return {
        id: item.pk,
        monthOf:            item.monthOf,
        payrollList:        item.payrollList,
        totalEmployee:      item.totalEmployee,
        totalGross:         item.totalGross,
        totalBenefits:      item.totalBenefits,
        totalTaxBenefit:    item.totalTaxBenefit,
        totalNetPay:        item.totalNetPay,
        totalNetSalary:     item.totalNetSalary,
        totalDeduction:     item.totalDeduction,
        totalTaxPaymentUS:  item.totalTaxPaymentUS,
        totalTaxPaymentKHM: item.totalTaxPaymentKHM,
        adjustment:         item.adjustment,
        status:             item.status,
        step:               item.step,
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
