'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const uuid = require('uuid')
// const dynamoDb = new AWS.DynamoDB.DocumentClient()

const dynamoDb = require('../../config/dynamodb')

module.exports.get = async (event, context) => {
    const dateFormat = require('dateformat')
//   const table = process.env.item_table
    const table = 'payroll-dev'
    const data = JSON.parse(event.body)
    const monthOf = data.monthOf
    let suffix = dateFormat(new Date(monthOf), data.structure)
    
    const abbr = data.abbr
    const type = data.type  
    const number = suffix.toString()
    const params = {
        TableName: table,
        IndexName: 'GSI1',
        KeyConditionExpression: 'sk = :sk AND begins_with(pk, :pk)',
        FilterExpression: '#abbr = :abbr and #type = :type',
        ExpressionAttributeValues: {
            ':sk': event.pathParameters.institute_id,
            ':pk': 'par-',
            ':abbr': abbr,
            ':type': type,
        },
        ExpressionAttributeNames: {
            '#type': 'type',
            '#abbr': 'abbr'
        },
    }
  try {
        let items = []
        let numbers = []
        do {
            items = await dynamoDb.query(params).promise()
            items.Items.forEach(item => {
                numbers.push({
                    number: item.number,
                    lastNumber: item.lastNumber,
                    abbr: item.abbr
                })
            })
            params.ExclusiveStartKey = items.LastEvaluatedKey
        } while (typeof items.LastEvaluatedKey != 'undefined')
        const lastNumber = Math.max.apply(Math, numbers.map(o => { return o.lastNumber }))

        let empty = {
            number: '',
            lastNumber: 1,
            abbr: abbr,
            suffix: suffix
        }
        let obj = numbers.filter(m => m.lastNumber == lastNumber).map(o => {
            return {
                number: o.number,
                lastNumber: parseInt(o.lastNumber.toString().substring(number.length)) + 1,
                abbr: o.abbr,
                suffix: suffix
            }
        })
        if (obj.length === 0) {
            obj = empty
        } else {
            obj = obj[0]
        }
        return {
            statusCode: code.httpStatus.OK,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // to allow cross origin access
            },
            body: json.responseBody(code.httpStatus.OK, obj, message.msg.FetchSuccessed, '', 1, {})
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

