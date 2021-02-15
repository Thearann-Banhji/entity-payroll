'use strict'

const AWS = require('aws-sdk')
const code = require('../../config/code.js')
const message = require('../../config/message.js')
const json = require('../../config/response.js')
const uuid = require('uuid')
// const dynamoDb = new AWS.DynamoDB.DocumentClient()
const dynamoDb = require('../../config/dynamodb')
let sizeThumb = 0
let sizeBigThumb = 0

module.exports.index = async (event) => {
  const sharp = require('sharp')
  const timestamp = new Date().toJSON()
  const data = JSON.parse(event.body)

  // const table = process.env.item_table
  const table = 'payroll-dev'
  const instituteId = event.pathParameters.institute_id
  let head = ''
  let images = {
    default: {
      thumb: '',
      bigThumb: '',
      size: 0 // as byte
    },
    gallery: []
  }
  const uploadFolder = 'images/'
  let thumb = uploadFolder + 'thumb_' + makeId(20) + '.jpg'
  let fileName = uploadFolder + makeId(30) + '.jpg'

  if (data.id === undefined || data.id === '') {
    head = 'emp-' + uuid.v1()
  } else {
    head = data.id
    images = data.image
    if (images) {
      if (Object.prototype.hasOwnProperty.call(images, 'default')) {
        if (Object.prototype.hasOwnProperty.call(images.default, 'thumb')) {
          thumb = uploadFolder + images.default.thumb
          fileName = uploadFolder + images.default.bigThumb
        }
      }
    }
  }
  if (data.file) {
    const buffer = Buffer.from(data.file, 'binary')
    await saveThumbnail(sharp, buffer, thumb, 200, 50)
    await saveImage(sharp, buffer, fileName, 50)
    images = {
      default: {
        thumb: thumb,
        bigThumb: fileName,
        size: (parseFloat(sizeThumb) + parseFloat(sizeBigThumb)) // as byte
      },
      gallery: []
    }
  }
  const pk = head
  const employee = {
    sk: instituteId,
    pk: pk,
    employeeType: data.employeeType,
    employeeId: data.employeeId,
    firstName: data.firstName,
    lastName: data.lastName,
    firstNameLocale: data.firstNameLocale,
    lastNameLocale: data.lastNameLocale,
    gender: data.gender,
    dob: data.dob,
    identityId: data.identityId,
    identityType: data.identityType,
    address: data.address,
    phone: data.phone,
    email: data.email,
    salaryAcc: data.salaryAcc,
    salaryAdvanceAcc: data.salaryAdvanceAcc,
    payrollLiabilitie: data.payrollLiabilitie,
    image: images,
    country: data.country,
    nationality: data.nationality,
    maritalStatus: data.maritalStatus,
    noOfChildren: data.noOfChildren,
    bank: data.bank,
    bankAccount: data.bankAccount,
    paymentPeriod: data.paymentPeriod,
    status: data.status,
    createdAt: timestamp,
    updatedAt: timestamp
  }
  const params = [
    {
      PutRequest: { //  todo: Employee
        Item: employee
      }
    },
    {
      PutRequest: { // todo: employee country
        Item: {
          sk: data.country.abbreviation,
          pk: pk,
          name: data.country.name,
          employee: employee,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
    },
    {
      PutRequest: { // todo: employee nationality
        Item: {
          sk: data.nationality.alpha3Code,
          pk: pk,
          name: data.nationality.nameEn,
          employee: employee,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
    },
    {
      PutRequest: { // todo: employee maritalStatus
        Item: {
          sk: data.maritalStatus.id,
          pk: pk,
          name: data.maritalStatus.name,
          employee: employee,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
    },
    {
      PutRequest: { // todo: employee paymentPeriod
        Item: {
          sk: data.paymentPeriod.id,
          pk: pk,
          name: data.paymentPeriod.name,
          employee: employee,
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
    if (Object.prototype.hasOwnProperty.call(data, 'gender')) {
      if (Object.prototype.hasOwnProperty.call(data.gender, 'name')) {
        const param = {
          TableName: table,
          Item: {
            sk: data.gender.name,
            pk: pk,
            name: data.gender.name,
            employee: employee,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        }
        await dynamoDb.put(param).promise()
      } else {
        const param = {
          TableName: table,
          Item: {
            sk: data.gender,
            pk: pk,
            name: data.gender,
            employee: employee,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        }
        await dynamoDb.put(param).promise()
      }
    }
    if (Object.prototype.hasOwnProperty.call(data, 'bank')) {
      if (Object.prototype.hasOwnProperty.call(data.bank, 'id')) {
        const param = {
          TableName: table,
          Item: {
            sk: data.bank.id,
            pk: pk,
            name: data.bank.name,
            employee: employee,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        }
        await dynamoDb.put(param).promise()
      }
    }
    if (Object.prototype.hasOwnProperty.call(data, 'employeeType')) {
      const param = {
        TableName: table,
        Item: {
          sk: data.employeeType.id,
          pk: pk,
          name: data.employeeType.name,
          employee: employee,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      }
      await dynamoDb.put(param).promise()
    }
    // Response Back
    const response = {
      id: pk,
      employeeType: data.employeeType,
      employeeId: data.employeeId,
      firstName: data.firstName,
      lastName: data.lastName,
      firstNameLocale: data.firstNameLocale,
      lastNameLocale: data.lastNameLocale,
      gender: data.gender,
      dob: data.dob,
      identityId: data.identityId,
      identityType: data.identityType,
      address: data.address,
      phone: data.phone,
      email: data.email,
      salaryAcc: data.salaryAcc,
      salaryAdvanceAcc: data.salaryAdvanceAcc,
      image: images,
      country: data.country,
      nationality: data.nationality,
      maritalStatus: data.maritalStatus,
      noOfChildren: data.noOfChildren,
      bank: data.bank,
      bankAccount: data.bankAccount,
      paymentPeriod: data.paymentPeriod,
      status: data.status
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
const makeId = function (length) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }
  return text
}

const saveImage = async function (sharp, buffer, filePath, quality = 50) {
  try {
    const bucketName = 'images.banhji'
    const bucket = new AWS.S3({
      params: {
        Bucket: bucketName
      }
    })

    await sharp(buffer) // keep original file but reduce quality to 50
      .jpeg({ progressive: true, force: false, quality: quality })
      .toBuffer()
      .then(file_ => {
        sizeBigThumb = Buffer.byteLength(file_)
        const response = bucket
          .upload({
            Bucket: bucketName,
            Key: filePath,
            Body: file_
          }).promise()
        response.then(() => {
          console.log(sizeBigThumb, 'size')
          // return size_
        })
      })
      .catch(err => {
        console.log('error', err)
        return -1
      })
    return 0
  } catch (e) {
    console.log('error', e)
    return -1
  }
}
const saveThumbnail = async function (sharp, buffer, thumbPath, sizeW, quality = 50) {
  try {
    const bucketName = 'images.banhji'
    const bucket = new AWS.S3({
      params: {
        Bucket: bucketName
      }
    })
    const size = 0
    await sharp(buffer) // thumbnail image
      .resize({
        width: sizeW,
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy
      })
      .jpeg({ progressive: true, force: false, quality: quality })
      .toBuffer()
      .then(file => {
        sizeThumb = Buffer.byteLength(file)
        const response = bucket
          .upload({
            Bucket: bucketName,
            Key: thumbPath,
            Body: file
          }).promise()
        response.then(() => {
          // return Buffer.byteLength(file)
          // console.log(size, 'size')
          return size
        })
      })
      .catch(err => {
        console.log('error', err)
        return -1
      })
    return 0
  } catch (e) {
    console.log('error', e)
    return -1
  }
}
