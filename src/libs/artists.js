const docClient = require('./document_client.js');
const config = require('./config.js');
const utils = require('./utilities.js');

class ArtistLibrary {
  processArtistResponse(artist) {
    if (!artist) {
      return null;
    }

    artist.albums = (artist.albums || []).map(album => {
      album.condition = album.condition || '';
      return album;
    });
    artist.albums.sort((a, b) => {
      return a.year <= b.year ? -1 : 1;
    });

    return artist;
  }

  async query(record) {
    const FilterExpressionArray = [];
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    Object.keys(record).map(key => {
      FilterExpressionArray.push(`#${key} = :${key}`);
      ExpressionAttributeNames[`#${key}`] = key;
      ExpressionAttributeValues[`:${key}`] = record[key];
    });

    const params = {
      TableName: config.ARTISTS_TABLE,
      FilterExpression: FilterExpressionArray.join(', '),
      ExpressionAttributeNames: ExpressionAttributeNames,
      ExpressionAttributeValues: ExpressionAttributeValues,
    };
    return ((await docClient.scan(params).promise()).Items || []).map(this.processArtistResponse);
  }

  async getByName(name, all = false) {
    const artistsByName = (await this.query({ name })) || [];

    if (all) {
      return artistsByName;
    }
    return artistsByName[0];
  }

  async getAll(sortBy) {
    const artistsResponse = await docClient
      .scan({
        TableName: config.ARTISTS_TABLE,
      })
      .promise();

    const artists = (artistsResponse.Items || []).map(this.processArtistResponse);

    if (['name'].includes(sortBy)) {
      artists.sort((a, b) => {
        return ('' + a[sortBy]).localeCompare(b[sortBy]);
      });
    }

    return artists;
  }

  async getOne(artistId) {
    if (!artistId) {
      return null;
    }

    const artist =
      (await docClient
        .get({
          TableName: config.ARTISTS_TABLE,
          Key: {
            id: artistId,
          },
        })
        .promise()).Item || null;

    return this.processArtistResponse(artist);
  }

  async update(artistId, record) {
    delete record.id;

    const UpdateExpressionArray = [];
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    Object.keys(record).map(key => {
      UpdateExpressionArray.push(`SET #${key} = :${key}`);
      ExpressionAttributeNames[`#${key}`] = key;
      ExpressionAttributeValues[`:${key}`] = record[key];
    });

    const params = {
      TableName: config.ARTISTS_TABLE,
      Key: {
        id: artistId,
      },
      UpdateExpression: UpdateExpressionArray.join(', '),
      ExpressionAttributeNames: ExpressionAttributeNames,
      ExpressionAttributeValues: ExpressionAttributeValues,
    };
    const rslt = await docClient.update(params).promise();

    return this.getOne(artistId);
  }

  async delete(artistId) {
    return await docClient
      .delete({
        TableName: config.ARTISTS_TABLE,
        Key: {
          id: artistId,
        },
      })
      .promise();
  }

  async put(artistId, record) {
    if (!artistId) {
      artistId = utils.uuidv4();
    }

    record.id = artistId;

    const params = {
      TableName: config.ARTISTS_TABLE,
      Item: record,
    };
    const rslt = await docClient.put(params).promise();

    return this.getOne(artistId);
  }

  async addAlbum(artistId, album) {
    const params = {
      TableName: config.ARTISTS_TABLE,
      Key: {
        id: artistId,
      },
      UpdateExpression: 'SET #albums = list_append(#albums, :albums)',
      ExpressionAttributeNames: {
        '#albums': 'albums',
      },
      ExpressionAttributeValues: {
        ':albums': [album],
      },
    };

    await docClient.update(params).promise();

    return this.getOne(artistId);
  }

  async setAlbums(artistId, albums) {
    const params = {
      TableName: config.ARTISTS_TABLE,
      Key: {
        id: artistId,
      },
      UpdateExpression: 'SET #albums = :albums',
      ExpressionAttributeNames: {
        '#albums': 'albums',
      },
      ExpressionAttributeValues: {
        ':albums': albums,
      },
    };

    await docClient.update(params).promise();

    return this.getOne(artistId);
  }
}

module.exports = new ArtistLibrary();
