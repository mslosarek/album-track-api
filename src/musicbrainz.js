const musicbrainzLib = require('./libs/musicbrainz.js');
const utilities = require('./libs/utilities.js');

const commonResponse = utilities.commonResponse;

/**
 * Looks up an artist on musicbrainz (POST /musicbrainz/artists)
 *
 * @param event Lambda event record
 * @param event.body Search body
 * @param event.name Artist name
 *
 */
module.exports.artists = async event => {
  let body = event.body || {};
  try {
    body = JSON.parse(body);
  } catch (err) {
    // unable to parse the json
  }
  const { name } = body;
  const query = [`artist:${name.replace(/ /, '\\\\ ')}*`].join(' AND ');

  try {
    const rslt = await musicbrainzLib.artists(query);

    return commonResponse({
      statusCode: 200,
      body: JSON.stringify(rslt, null, 2),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};

/**
 * Looks up an artist on musicbrainz (POST /musicbrainz/albums)
 *
 * @param event Lambda event record
 * @param event.body Search body
 * @param event.title Album name
 * @param event.artist Artist name
 *
 */
module.exports.albums = async event => {
  let body = event.body || {};
  try {
    body = JSON.parse(body);
  } catch (err) {
    // unable to parse the json
  }
  const { title, artist } = body;

  const queryParts = [`country:"US"`, `status:"official"`];
  if (title) {
    queryParts.push(`release:${title}*`);
  }
  if (artist) {
    queryParts.push(`artist:${artist}*`);
  }

  const query = queryParts.join(' AND ');

  try {
    let rslt = await musicbrainzLib.albums(query);

    rslt = utilities.uniq(rslt, (albums, album) => {
      return albums.findIndex(a => {
        return (
          a.title === album.title &&
          a.artist === album.artist &&
          a.country === album.country &&
          a.year === album.year &&
          a.tracks === album.tracks &&
          a.format === album.format
        );
        return true;
      });
    });

    return commonResponse({
      statusCode: 200,
      body: JSON.stringify(rslt, null, 2),
    });
  } catch (err) {
    return commonResponse({
      statusCode: 500,
      body: JSON.stringify(err),
    });
  }
};
