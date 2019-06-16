const AWS = require('aws-sdk');
const config = require('./config.js');

AWS.config.update({
  region: config.AWS_REGION,
});

const docClientConfig = {
  region: config.AWS_REGION,
  convertEmptyValues: true,
};

if (config.AWS_DYNAMO_ENDPOINT) {
  docClientConfig.endpoint = config.AWS_DYNAMO_ENDPOINT;
}

const docClient = new AWS.DynamoDB.DocumentClient(docClientConfig);

module.exports = docClient;
