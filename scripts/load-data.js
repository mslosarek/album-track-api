const path = require('path');

process.env.AWS_REGION = 'us-west-2';
process.env.ARTISTS_TABLE = 'album-track-api-dev-artists';

const config = require('../src/libs/config.js');
const artists = require('../dynamodb-seeds/artists.json');
const docClient = require('../src/libs/document_client.js');

(async () => {
  for (artist of artists) {
    // console.log(artist);

    const params = {
      TableName: process.env.ARTISTS_TABLE,
      Item: artist,
    };

    const rslt = await docClient.put(params).promise();

    console.log(rslt);
  }
})();
