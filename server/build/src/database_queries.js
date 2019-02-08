"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllSongs = getAllSongs;
exports.getAllOriginals = getAllOriginals;
exports.getAllCovers = getAllCovers;

function getAllSongs(pool, artistId) {
  return query(pool, "\n        SELECT \"Song\".name as name, COUNT(*) as times_played\n        FROM \"Song\", (\n            SElECT \"Set_Song\".song_id as id\n            FROM \"Set_Song\", (\n                SELECT \"Set\".id\n                FROM \"Set\", (\n                    SELECT \"Setlist\".id as id\n                    FROM \"Setlist\"\n                    WHERE \"Setlist\".artist_id = '".concat(artistId, "') as artists_setlists\n                WHERE \"Set\".setlist_id = artists_setlists.id) as set_ids\n            WHERE set_ids.id = \"Set_Song\".set_id ) as song_ids\n        WHERE \"Song\".id = song_ids.id\n        GROUP BY name\n        ORDER BY times_played DESC\n    "));
}

function getAllOriginals(pool, artistId) {
  return query(pool, "\n        SELECT \"Song\".name as name, COUNT(*) as times_played\n        FROM \"Song\", (\n            SElECT \"Set_Song\".song_id as id\n            FROM \"Set_Song\", (\n                SELECT \"Set\".id\n                FROM \"Set\", (\n                    SELECT \"Setlist\".id as id\n                    FROM \"Setlist\"\n                    WHERE \"Setlist\".artist_id = '".concat(artistId, "') as artists_setlists\n                WHERE \"Set\".setlist_id = artists_setlists.id) as set_ids\n            WHERE set_ids.id = \"Set_Song\".set_id ) as song_ids\n        WHERE \"Song\".id = song_ids.id AND \"Song\".artist_id = '").concat(artistId, "'\n        GROUP BY name\n        ORDER BY times_played DESC\n    "));
}

function getAllCovers(pool, artistId) {
  return query(pool, "\n        SELECT \"Song\".name as name, COUNT(*) as times_played\n        FROM \"Song\", (\n            SElECT \"Set_Song\".song_id as id\n            FROM \"Set_Song\", (\n                SELECT \"Set\".id\n                FROM \"Set\", (\n                    SELECT \"Setlist\".id as id\n                    FROM \"Setlist\"\n                    WHERE \"Setlist\".artist_id = '".concat(artistId, "'\n                ) as artists_setlists\n                WHERE \"Set\".setlist_id = artists_setlists.id) as set_ids\n            WHERE set_ids.id = \"Set_Song\".set_id ) as song_ids\n        WHERE \"Song\".id = song_ids.id AND \"Song\".artist_id != '").concat(artistId, "'\n        GROUP BY name\n        ORDER BY times_played DESC\n    "));
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