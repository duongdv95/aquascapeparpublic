const AWS = require('aws-sdk');
const awsconfig = require("./awsconfig")
AWS.config.update(awsconfig)
const docClient = new AWS.DynamoDB.DocumentClient()
const shortid   = require("shortid")
const table = "aquariumpardata"


async function getFixture({ url_id, query }) {
    if(url_id && url_id.length > 0) {
        const params = {
            TableName: table,
            Key: {
                "url_id": url_id
            }
        }
        const response = await docClient.get(params).promise();
        if(response.Item) {
            return {success: true, fixturesArray: [response.Item], numHits: 1}
        } else {
            return {success: false, fixturesArray: [], numHits: 0, message: "Invalid ID"}
        }
    } else if(query && query.length > 0 && query !== "all") {
        const params = {
            TableName: table,
            IndexName: "make-index",
            KeyConditionExpression: "make = :v_title",
            ExpressionAttributeValues: {
                ":v_title": query
            },
            ProjectionExpression: "url_id, created_at, images, make, model, notes, PAR, product_links, specifications",
            ScanIndexForward: false
        }
        const response = await docClient.query(params).promise();
        if(response.Items) {
            return {success: true, fixturesArray: response.Items, numHits: response.Items.length}
        } else {
            return {success: false, fixturesArray: [], numHits: 0, message: "Invalid ID"}
        }
    } else if(query === "all") {
        const params = {
            TableName: table,
          };
        const response = await docClient.scan(params).promise()
        if(response.Items) {
            return {success: true, fixturesArray: response.Items, numHits: response.Items.length}
        } else {
            return {success: false, fixturesArray: [], numHits: 0, message: "Invalid ID"}
        }
    } else {
        return {success: false, fixturesArray: [], numHits: 0, message: "Invalid ID"}
    }
}

async function addFixture({fixtureData}) {
    const timestamp = new Date().getTime();
    const {make, model, specifications, PAR, product_links, notes} = fixtureData
    let url_id = shortid.generate()
    const params = {
        TableName: table,
        Item: {
            make, model, specifications, 
            PAR, product_links, notes, 
            url_id, created_at: timestamp,
            images: ["https://d2s6kvwb83n6p4.cloudfront.net/No_image_available_600_x_450.svg"]
        }
    }
    let response
    await docClient.put(params).promise().then(function(data) {
        response = {success: true, message: "", url_id}
    }).catch(function(err) {
        response = {success: false, message: "Error! Could not add fixture"}
    })
    return response
}

async function addImagesToFixture({ url_id, imagesArray }) {
    let cloudFront = imagesArray.map(function(element) {
        return element.replace("https://aquariumpardata.s3.amazonaws.com/","https://d2s6kvwb83n6p4.cloudfront.net/")
    })
    const params = {
        TableName: table,
        Key: {
            url_id
        },
        UpdateExpression: "set images = :i",
        ExpressionAttributeValues:{
            ":i":cloudFront
        },
        ReturnValues:"UPDATED_NEW"
    }
    const response = await docClient.update(params).promise()
    if(response.Attributes.images) {
        return {success: true, message: `Images added to database for Fixture: ${url_id}`}
    } else {
        return {success: false, message: `Error. Images did not upload for Fixture: ${url_id}`}
    }
}

async function editFixture({ fixtureData, url_id }) {
    const {make, model, specifications, PAR, product_links, notes} = fixtureData
    const params = {
        TableName: table,
        Key: {
            url_id
        },
        UpdateExpression: "set make = :a, model = :b, specifications = :c, PAR = :d, product_links = :e, notes = :f",
        ExpressionAttributeValues:{
            ":a": make,
            ":b": model,
            ":c": specifications,
            ":d": PAR,
            ":e": product_links,
            ":f": notes
        },
        ReturnValues:"UPDATED_NEW"
    }
    const response = await docClient.update(params).promise()
    if(response.Attributes) {
        return {success: true, message: `Fixture: ${url_id} updated`, url_id}
    } else {
        return {success: false, message: `Error. Fixture: ${url_id} did not update`}
    }
}

async function deleteFixture({ url_id }) {
    const params = {
        TableName: table,
        Key:{
            url_id
        }
    }
    const response = await docClient.delete(params).promise()
    console.log(response)
    if(response) {
        return {success: true, message: `Fixture: ${url_id} deleted`, url_id}
    } else {
        return {success: false, message: `Error. Fixture: ${url_id} not deleted`}
    }
}

module.exports = {
    getFixture,
    addFixture,
    addImagesToFixture,
    editFixture,
    deleteFixture
}
