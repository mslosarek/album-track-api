const artistsLib = require('./libs/artists.js');
const utilities = require('./libs/utilities.js');

const commonResponse = utilities.commonResponse;

/**
 * Retrieve all artists (GET /artists)
 *
 */
module.exports.getAll = async event => {
  try {
    const artists = await artistsLib.getAll('name');

    return commonResponse({
      statusCode: 200,
      body: JSON.stringify(artists),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};

/**
 * Retrieve an artist by id (GET /artists/{artistId})
 *
 * @param event Lambda event record
 * @param event.pathParameters.artistId Unique ID of the artist
 *
 */
module.exports.getOne = async event => {
  const artistId = event.pathParameters.artistId;
  try {
    const artist = await artistsLib.getOne(artistId);

    if (!artist) {
      return commonResponse({
        statusCode: 404,
        body: JSON.stringify('Not Found'),
      });
    }
    return commonResponse({
      statusCode: 200,
      body: JSON.stringify(artist),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};

/**
 * Retrieve albums for an artist (GET /artists/{artistId}/albums)
 *
 * @param event Lambda event record
 * @param event.pathParameters.artistId Unique ID of the artist
 *
 */
module.exports.getAlbums = async event => {
  const artistId = event.pathParameters.artistId;
  try {
    const artist = await artistsLib.getOne(artistId);

    if (!artist) {
      return commonResponse({
        statusCode: 404,
        body: JSON.stringify('Not Found'),
      });
    }
    return commonResponse({
      statusCode: 200,
      body: JSON.stringify(artist.albums),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};

/**
 * Retrieve album for an artist (GET /artists/{artistId}/albums/{albumId})
 *
 * @param event Lambda event record
 * @param event.pathParameters.artistId Unique ID of the artist
 * @param event.pathParameters.albumId Unique ID of the album
 *
 */
module.exports.getAlbum = async event => {
  const artistId = event.pathParameters.artistId;
  const albumId = event.pathParameters.albumId;
  try {
    const artist = await artistsLib.getOne(artistId);

    if (!artist) {
      return commonResponse({
        statusCode: 404,
        body: JSON.stringify('Not Found'),
      });
    }

    const album = (artist.albums || []).find(a => {
      return a.id === albumId;
    });

    if (!album) {
      return commonResponse({
        statusCode: 404,
        body: JSON.stringify('Not Found'),
      });
    }

    return commonResponse({
      statusCode: 200,
      body: JSON.stringify(album),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};

/**
 * Deletes an album from the artist (DELETE /artists/{artistId}/albums/{albumId})
 *
 * @param event Lambda event record
 * @param event.pathParameters.artistId Unique ID of the artist
 * @param event.pathParameters.albumId Unique ID of the album
 *
 */
module.exports.deleteAlbum = async event => {
  const artistId = event.pathParameters.artistId;
  const albumId = event.pathParameters.albumId;
  try {
    const artist = await artistsLib.getOne(artistId);

    if (!artist) {
      return commonResponse({
        statusCode: 404,
        body: JSON.stringify('Not Found'),
      });
    }
    artist.albums = artist.albums || [];

    let albums = artist.albums.filter(a => {
      return a.id !== albumId;
    });

    if (albums.length === artist.albums.length) {
      return commonResponse({
        statusCode: 404,
        body: JSON.stringify('Not Found'),
      });
    }

    await artistsLib.setAlbums(artistId, albums);

    return commonResponse({
      statusCode: 200,
      body: JSON.stringify('OK'),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};

/**
 * Add and album to an artist (POST /artists/{artistId}/albums)
 *
 * @param event Lambda event record
 * @param event.pathParameters.artistId Unique ID of the artist
 * @param event.body Album record
 * @param event.body.title Album title
 * @param event.body.year Album year
 * @param event.body.condition Album condition
 *
 */
module.exports.addAlbum = async event => {
  const artistId = (event.pathParameters || {}).artistId;

  let body = event.body || {};

  try {
    body = JSON.parse(body);
  } catch (err) {
    // unable to parse json
  }

  if (!body || !body.title || !body.year || !body.condition) {
    return commonResponse({
      statusCode: 400,
      body: JSON.stringify('Title, Year and Condition are required'),
    });
  }

  body.id = body.id || utilities.uuidv4();

  try {
    let artist = await artistsLib.getOne(artistId);

    if (!artist) {
      return commonResponse({
        statusCode: 404,
        body: JSON.stringify('Not Found'),
      });
    }

    const existingAlbum = artist.albums.find(a => {
      return a.id === body.id;
    });

    if (existingAlbum) {
      return commonResponse({
        statusCode: 409,
        body: JSON.stringify('Duplicate Album'),
      });
    }

    if (artist.albums && artist.albums.length) {
      artist = await artistsLib.addAlbum(artistId, body);
    } else {
      artist = await artistsLib.setAlbums(artistId, [body]);
    }

    return commonResponse({
      statusCode: 200,
      body: JSON.stringify(artist),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};

/**
 * Update and album (PUT /artists/{artistId}/albums/{albumId})
 *
 * @param event Lambda event record
 * @param event.pathParameters.artistId Unique ID of the artist
 * @param event.pathParameters.albumId Unique ID of the album
 * @param event.body Album record
 * @param event.body.title Album title
 * @param event.body.year Album year
 * @param event.body.condition Album condition
 *
 */
module.exports.updateAlbum = async event => {
  const artistId = event.pathParameters.artistId;
  const albumId = event.pathParameters.albumId;

  let body = event.body || {};

  try {
    body = JSON.parse(body);
  } catch (err) {
    // unable to parse json
  }

  if (!body || !body.title || !body.year || !body.condition) {
    return commonResponse({
      statusCode: 400,
      body: JSON.stringify('Title, Year and Condition are required'),
    });
  }

  delete body.id;

  try {
    let artist = await artistsLib.getOne(artistId);

    if (!artist) {
      return commonResponse({
        statusCode: 404,
        body: JSON.stringify('Not Found'),
      });
    }

    const album = (artist.albums || []).find(a => {
      return a.id === albumId;
    });

    if (!album) {
      return commonResponse({
        statusCode: 404,
        body: JSON.stringify('Not Found'),
      });
    }

    Object.assign(album, body);
    artist = await artistsLib.setAlbums(artistId, artist.albums);

    return commonResponse({
      statusCode: 200,
      body: JSON.stringify(artist),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};

/**
 * Updates an Artist (PUT /artists/{artistId})
 *
 * @param event Lambda event record
 * @param event.pathParameters.artistId Unique ID of the artist
 * @param event.body Artist record
 * @param event.name Artist name
 *
 */
module.exports.update = async event => {
  const artistId = event.pathParameters.artistId;
  const artist = await artistsLib.getOne(artistId);

  if (!artist) {
    return commonResponse({
      statusCode: 404,
      body: JSON.stringify('Not Found'),
    });
  }

  let body = event.body || {};

  try {
    body = JSON.parse(body);
  } catch (err) {
    // unable to parse json
  }

  try {
    const rslt = await artistsLib.update(artistId, {name: body.name});
    return commonResponse({
      statusCode: 200,
      body: JSON.stringify(rslt),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};

/**
 * Deletes an artist (DELETE /artists/{artistId})
 *
 * @param event Lambda event record
 * @param event.pathParameters.artistId Unique ID of the artist
 *
 */
module.exports.delete = async event => {
  const artistId = (event.pathParameters || {}).artistId;
  const artist = await artistsLib.getOne(artistId);

  if (!artist) {
    return commonResponse({
      statusCode: 404,
      body: JSON.stringify('Not Found'),
    });
  }

  try {
    const rslt = await artistsLib.delete(artistId);
    return commonResponse({
      statusCode: 200,
      body: JSON.stringify('OK'),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};

/**
 * Creates an artist (POST /artists)
 *
 * @param event Lambda event record
 * @param event.body Artist record
 * @param event.body.name Artist name
 *
 */
module.exports.create = async event => {
  let body = event.body || {};

  try {
    body = JSON.parse(body);
  } catch (err) {
    // unable to parse json
  }

  const artistByName = await artistsLib.getByName(body.name);

  if (artistByName) {
    return commonResponse({
      statusCode: 409,
      body: JSON.stringify('Duplicate Artist'),
    });
  }

  const artistId = (event.pathParameters || {}).artistId;
  if (artistId) {
    const artist = await artistsLib.getOne(artistId);

    if (!artist) {
      return commonResponse({
        statusCode: 404,
        body: JSON.stringify('Not Found'),
      });
    }
  }

  if (body.id) {
    const artist = await artistsLib.getOne(body.id);

    if (artist) {
      return commonResponse({
        statusCode: 409,
        body: JSON.stringify('Duplicate Artist'),
      });
    }
  }

  const rslt = await artistsLib.put(body.id || null, body);

  try {
    return commonResponse({
      statusCode: 200,
      body: JSON.stringify(rslt),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};
