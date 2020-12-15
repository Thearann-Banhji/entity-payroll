'use strict'
const AWS = require('aws-sdk')
let options = {}
  options = {
    region: 'local',
    endpoint: 'http://localhost:8000',
    accessKeyId: "higt1s",
    secretAccessKey: "f7epd"
  }
const client = new AWS.DynamoDB.DocumentClient(options)
module.exports = client