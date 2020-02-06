const serverless = require('serverless-http')
const binaryMimeTypes = require('./binaryMimeTypes')

const server = require('./server/ssr-server.js')
module.exports.server = serverless(server, {
  binary: binaryMimeTypes
})