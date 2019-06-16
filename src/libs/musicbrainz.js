const axios = require('axios');

module.exports.artists = async query => {
  try {
    const rslt = await axios.get('https://musicbrainz.org/ws/2/artist', {
      params: {
        query: query,
        fmt: 'json',
      },
    });

    return rslt.data.artists
      .map(artist => {
        return {
          id: artist.id,
          name: artist.name,
          lifespan: artist['life-span'],
          country: artist.country,
        };
      })
      .map(artist => {
        try {
          artist.lifespan.begin = new Date(artist.lifespan.begin).toISOString().substr(0, 4) || '';
        } catch (err) {
          // ignore
        }
        try {
          artist.lifespan.end = new Date(artist.lifespan.end).toISOString().substr(0, 4) || '';
        } catch (err) {
          // ignore
        }

        return artist;
      })
      .filter(a => a.country);
  } catch (err) {
    return err.data;
  }
};

module.exports.albums = async query => {
  try {
    const rslt = await axios.get('https://musicbrainz.org/ws/2/release', {
      params: {
        query: query,
        fmt: 'json',
      },
    });

    return rslt.data.releases
      .map(release => {
        return {
          id: release.id,
          title: release.title,
          artist: release['artist-credit'][0].artist.name,
          year: release.date,
          country: release.country,
          tracks: release['track-count'],
          format: ((release.media || [])[0] || {}).format,
        };
      })
      .map(release => {
        try {
          release.year = new Date(release.year).toISOString().substr(0, 4);
        } catch (err) {
          // ignore
        }
        return release;
      })
      .filter(a => a.country);
  } catch (err) {
    return err.data;
  }
};
