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
      ':type': 'spt-'
    },
    IndexName: 'GSI1',
    KeyConditionExpression: 'sk = :sk and begins_with(pk, :type)',
    TableName: table
  }
  try {
    const data = await dynamoDb.query(params).promise()
    const results = data.Items.map(item => {
      return {
        id: item.pk,
        name: item.name,
        abbr: item.abbr,
        nature: item.nature,
        accountReceivable: item.accountReceivable,
        defaultTax: item.defaultTax,
        saleDeposit: item.saleDeposit,
        defaultTaxOnShipping: item.defaultTaxOnShipping,
        settlementDiscount: item.settlementDiscount,
        defaultPaymentTerm: item.defaultPaymentTerm,
        defaultPaymentMethod: item.defaultPaymentMethod
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
