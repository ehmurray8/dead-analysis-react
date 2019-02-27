"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllSongs = getAllSongs;
exports.getAllOriginals = getAllOriginals;
exports.getAllCovers = getAllCovers;
exports.getAllSetlistsBySong = getAllSetlistsBySong;
exports.getSetlistInfo = getSetlistInfo;

function getAllSongs(pool, artistId) {
  return query(pool, "\n        SELECT \"Song\".name as name, COUNT(*) as times_played, \"Song\".id as song_id\n        FROM \"Song\", (\n            SElECT \"Set_Song\".song_id as id\n            FROM \"Set_Song\", (\n                SELECT \"Set\".id\n                FROM \"Set\", (\n                    SELECT \"Setlist\".id as id\n                    FROM \"Setlist\"\n                    WHERE \"Setlist\".artist_id = '".concat(artistId, "') as artists_setlists\n                WHERE \"Set\".setlist_id = artists_setlists.id) as set_ids\n            WHERE set_ids.id = \"Set_Song\".set_id ) as song_ids\n        WHERE \"Song\".id = song_ids.id\n        GROUP BY name, song_id\n        ORDER BY times_played DESC\n    "));
}

function getAllOriginals(pool, artistId) {
  return query(pool, "\n        SELECT \"Song\".name as name, COUNT(*) as times_played, \"Song\".id as song_id\n        FROM \"Song\", (\n            SElECT \"Set_Song\".song_id as id\n            FROM \"Set_Song\", (\n                SELECT \"Set\".id\n                FROM \"Set\", (\n                    SELECT \"Setlist\".id as id\n                    FROM \"Setlist\"\n                    WHERE \"Setlist\".artist_id = '".concat(artistId, "') as artists_setlists\n                WHERE \"Set\".setlist_id = artists_setlists.id) as set_ids\n            WHERE set_ids.id = \"Set_Song\".set_id ) as song_ids\n        WHERE \"Song\".id = song_ids.id AND \"Song\".artist_id = '").concat(artistId, "'\n        GROUP BY name, song_id\n        ORDER BY times_played DESC\n    "));
}

function getAllCovers(pool, artistId) {
  return query(pool, "\n    SELECT name_ids.name as name, \"Artist\".name as artist_name, name_ids.times_played, name_ids.song_id as song_id\n    FROM \"Artist\", (\n        SELECT \"Song\".name as name, \"Song\".artist_id as artist_id, COUNT(*) as times_played, \"Song\".id as song_id\n        FROM \"Song\", (\n            SElECT \"Set_Song\".song_id as id\n            FROM \"Set_Song\", (\n                SELECT \"Set\".id\n                FROM \"Set\", (\n                    SELECT \"Setlist\".id as id\n                    FROM \"Setlist\"\n                    WHERE \"Setlist\".artist_id = '".concat(artistId, "' \n                ) as artists_setlists\n                WHERE \"Set\".setlist_id = artists_setlists.id) as set_ids\n            WHERE set_ids.id = \"Set_Song\".set_id ) as song_ids\n        WHERE \"Song\".id = song_ids.id AND \"Song\".artist_id != '").concat(artistId, "'\n        GROUP BY name, artist_id, song_id\n        ORDER BY times_played DESC) as name_ids\n    WHERE \"Artist\".mbid = name_ids.artist_id\n    "));
}

function getAllSetlistsBySong(pool, songId, artistId) {
  songId = songId.replace(/'/g, "''");
  return query(pool, "\n        SELECT venue_info.event_date, venue_info.tour_name, venue_info.id, venue_info.venue_name, \"City\".name as city_name, \"City\".state, \"City\".country_name\n        FROM \"City\", (\n            SELECT setlist_info.event_date, setlist_info.tour_name, setlist_info.id, \"Venue\".name as venue_name, \"Venue\".city_id\n            FROM \"Venue\", (\n                SELECT \"Setlist\".event_date, \"Setlist\".tour_name, \"Setlist\".venue_id, \"Setlist\".id\n                FROM \"Setlist\", (\n                    SELECT \"Set\".setlist_id as setlist_id\n                    FROM \"Set\", (\n                        SELECT \"Set_Song\".set_id as set_id\n                        FROM \"Set_Song\"\n                        WHERE \"Set_Song\".song_id = '".concat(songId, "') as set_ids\n                    WHERE set_ids.set_id = \"Set\".id) as setlist_ids\n                WHERE \"Setlist\".id = setlist_ids.setlist_id AND \"Setlist\".artist_id = '").concat(artistId, "') as setlist_info\n            WHERE \"Venue\".id = setlist_info.venue_id) as venue_info\n        WHERE \"City\".id = venue_info.city_id\n        ORDER BY venue_info.event_date DESC\n    "));
}

function getSetlistInfo(pool, setlistId) {
  return query(pool, "\n        SELECT \"Song\".name as song_name, \"Artist\".name as song_artist_name, songs.event_date, songs.tour_name, songs.url, songs.name as set_name, songs.infos, songs.artist_name, songs.city_name,\n            songs.state, songs.country_name, songs.venue_name, songs.info, songs.latitude, songs.longitude, songs.song_id\n        FROM \"Song\", \"Artist\", (\n            SELECT \"Set_Song\".song_id, infos.*\n            FROM \"Set_Song\", (\n                SELECT set_infos.*, \"Artist\".name as artist_name, \"Venue\".name as venue_name, \"City\".name as city_name, \"City\".state, \"City\".country_name, \"City\".latitude, \"City\".longitude\n                FROM \"Artist\", \"Venue\", \"City\", (\n                    SELECT sets_setlists.*\n                    FROM \"Venue\", (\n                        SELECT setlist.event_date, setlist.artist_id, setlist.tour_name, setlist.info, setlist.url, setlist.venue_id, \"Set\".id as set_id, \"Set\".*\n                        FROM \"Set\", (\n                            SELECT * \n                            FROM \"Setlist\" \n                            WHERE \"Setlist\".id = '".concat(setlistId, "') as setlist\n                        WHERE \"Set\".setlist_id = setlist.id) as sets_setlists\n                    WHERE \"Venue\".id = sets_setlists.venue_id) as set_infos\n                WHERE \"Artist\".mbid = set_infos.artist_id AND \"Venue\".id = set_infos.venue_id AND \"Venue\".city_id = \"City\".id) as infos\n            WHERE \"Set_Song\".set_id = infos.set_id) as songs\n        WHERE \"Song\".id = songs.song_id AND \"Song\".artist_id = \"Artist\".mbid\n    "));
}

function query(pool, queryString) {
  return new Promise(function (resolve, reject) {
    pool.connect().then(function (client) {
      client.query(queryString, function (queryError, response) {
        client.release();

        if (queryError) {
          reject(queryError);
        } else {
          var results = response.rows;
          resolve(results);
        }
      });
    }).catch(function () {
      return console.log("Connection error");
    });
  });
}
//# sourceMappingURL=database_queries.js.map