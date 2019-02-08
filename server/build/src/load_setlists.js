"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _keys = require("./keys");

var _v = _interopRequireDefault(require("uuid/v4"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function loadSetlists(mbid, pool) {
  var setlistFm = _axios.default.create({
    baseURL: 'https://api.setlist.fm/rest/1.0/artist/' + mbid + "/setlists",
    headers: {
      'x-api-key': _keys.ApiKey,
      Accept: 'application/json'
    }
  });

  function addSetlists(newSetlists) {
    if (newSetlists) {
      insertSetlistsIntoDatabase(newSetlists, pool);
    }
  }

  setlistFm.get("/?p=1").then(function (response) {
    var setlists = response.data.setlist;
    var itemsPerPage = response.data.itemsPerPage;
    var total = response.data.total;
    addSetlists(setlists);
    var lastPage = Math.ceil(total / itemsPerPage);
    var currentPage = 2;

    if (lastPage) {
      var handleError = function handleError() {
        console.log("Setlist fm fetch error");
      };

      var intervalId = setInterval(function () {
        if (currentPage > lastPage) {
          clearInterval(intervalId);
          return;
        }

        setlistFm.get("/?p=" + currentPage).then(function (response) {
          return addSetlists(response.data.setlist);
        }).catch(function (err) {
          return handleError(err);
        });
        currentPage += 1;
      }, 500);
    }
  }).catch(function (error) {
    return console.log(error);
  });
}

function insertSetlistsIntoDatabase(setlists, pool) {
  var handleError = function handleError(err) {
    console.log(err);
  };

  setlists.forEach(function (setlist) {
    var artist = setlist.artist;
    var currentArtistId = artist.mbid;
    console.log(setlist.id);
    insertIntoTable("Artist", [artist.mbid, artist.name, artist.sortName, artist.tmid], pool).then(function () {
      var city = setlist.venue.city;
      var coordinates = city.coords;
      var country = city.country;
      insertIntoTable("City", [city.id, city.name, city.state, city.stateCode, coordinates.long, coordinates.lat, country.code, country.name], pool).then(function () {
        var venue = setlist.venue;
        insertIntoTable("Venue", [venue.id, venue.name, city.id], pool).catch(handleError).then(function () {
          var sets = setlist.sets.set;

          if (sets) {
            var songToArtistId = function songToArtistId(song) {
              return song && song.cover && song.cover.mbid || currentArtistId;
            };

            var songToSongId = function songToSongId(song) {
              var name = song.name;
              return name + "=!=" + songToArtistId(song);
            };

            var encoreIndex = 1;
            sets.forEach(function (set, index) {
              var encore = set.encore;
              var setId = (0, _v.default)();
              var setName;

              if (encore) {
                setName = "Encore " + encoreIndex;
                encoreIndex += 1;
              } else {
                setName = "Set " + (index + 1);
              }

              insertIntoTable('Setlist', [setlist.id, setlist.versionId, eventDateToDate(setlist.eventDate), new Date(setlist.lastUpdated).toISOString(), currentArtistId, setlist.tour.name, setlist.info, setlist.url, venue.id], pool).catch(handleError).then(function () {
                insertIntoTable('Set', [setId, setName, Boolean(encore), set.song.map(function (song) {
                  return song.info;
                }), setlist.id], pool).catch(handleError).then(function () {
                  var songs = set.song;
                  songs.forEach(function (song) {
                    var name = song.name;
                    var songId = songToSongId(song);
                    var artistId = songToArtistId(song);

                    function addToSongAndSetSong() {
                      insertIntoTable('Song', [songId, name, artistId], pool).catch(handleError).then(function () {
                        insertIntoTable('Set_Song', [setId, songId], pool).catch(handleError);
                      });
                    }

                    if (artistId !== currentArtistId) {
                      var coverArtistName = song.cover.name;
                      var coverArtistSortName = song.cover.sortName;
                      insertIntoTable('Artist', [artistId, coverArtistName, coverArtistSortName, song.cover.tmid], pool).then(function () {
                        addToSongAndSetSong();
                      }).catch(handleError);
                    } else {
                      addToSongAndSetSong();
                    }
                  });
                });
              });
            });
          }
        });
      }).catch(handleError);
    }).catch(handleError);
  });
}

function eventDateToDate(dateStr) {
  var _dateStr$split = dateStr.split("-"),
      _dateStr$split2 = _slicedToArray(_dateStr$split, 3),
      day = _dateStr$split2[0],
      month = _dateStr$split2[1],
      year = _dateStr$split2[2];

  return new Date(year, month - 1, day).toISOString();
}

function insertIntoTable(table, values, pool) {
  var placeholders = values.map(function (x, index) {
    return "$" + (index + 1).toString();
  }).join();
  return new Promise(function (resolve, reject) {
    pool.connect().then(function (client) {
      client.query('INSERT INTO "public"."' + table + '" VALUES (' + placeholders + ") ON CONFLICT DO NOTHING;", values, function (queryError) {
        client.release();

        if (queryError) {
          reject(queryError);
        } else {
          resolve();
        }
      });
    }).catch(function () {
      return console.log("Connection error");
    });
  });
}

var _default = loadSetlists;
exports.default = _default;
//# sourceMappingURL=load_setlists.js.map