const environmentVariables = ['ARTISTS_TABLE', 'AWS_REGION'];

environmentVariables.forEach(environmentVariable => {
  module.exports[environmentVariable] = process.env[environmentVariable];
});

if (module.exports.AWS_REGION === 'localhost') {
  module.exports.AWS_DYNAMO_ENDPOINT = 'http://localhost:8000';
}
