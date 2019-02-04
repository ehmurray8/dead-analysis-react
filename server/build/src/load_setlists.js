"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _keys = require("./keys");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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
        insertIntoTable("Venue", [venue.id, venue.name, city.id], pool).catch(handleError);
        var sets = setlist.sets.set;

        if (sets) {
          var artistId = function artistId(song) {
            return song && song.cover && song.cover.mbid || currentArtistId;
          };

          var songToSongId = function songToSongId(song) {
            var name = song.name;
            return artistId(song) + "==" + name;
          };

          var setlist_songs = [];
          var setlist_songs_infos = [];
          var encores = [];
          var encores_infos = [];
          sets.forEach(function (set) {
            var encore = set.encore;

            if (encore) {
              encores.push.apply(encores, _toConsumableArray(set.song.map(function (song) {
                return songToSongId(song);
              })));
              encores_infos.push.apply(encores_infos, _toConsumableArray(set.song.map(function (song) {
                return song.info;
              })));
            } else {
              setlist_songs.push(set.song.map(function (song) {
                return songToSongId(song);
              }));
              setlist_songs_infos.push(set.song.map(function (song) {
                return song.info;
              }));
            }

            var maxLength = 0;
            setlist_songs.forEach(function (set_songs) {
              if (set_songs.length > maxLength) {
                maxLength = set_songs.length;
              }
            });

            for (var i = 0; i < setlist_songs.length; i++) {
              var setLength = setlist_songs[i].length;

              if (setLength < maxLength) {
                var _setlist_songs$i, _setlist_songs_infos$;

                (_setlist_songs$i = setlist_songs[i]).push.apply(_setlist_songs$i, _toConsumableArray(Array(maxLength - setLength).fill(null)));

                (_setlist_songs_infos$ = setlist_songs_infos[i]).push.apply(_setlist_songs_infos$, _toConsumableArray(Array(maxLength - setLength).fill(null)));
              }
            }

            var songs = set.song;
            songs.forEach(function (song) {
              var name = song.name;
              var songId = name.replace(" ", "_") + "==" + artistId(song);

              if (artistId(song) !== currentArtistId) {
                var coverArtistName = song.cover.name;
                var coverArtistSortName = song.cover.sortName;
                insertIntoTable('Artist', [artistId(song), coverArtistName, coverArtistSortName, song.cover.tmid], pool).then(function () {
                  insertIntoTable('Song', [songId, name, artistId(song)], pool).catch(handleError);
                }).catch(handleError);
              } else {
                insertIntoTable('Song', [songId, name, artistId(song)], pool).catch(handleError);
              }
            });
          });
          insertIntoTable('Setlist', [setlist.id, setlist.versionId, eventDateToDate(setlist.eventDate), new Date(setlist.lastUpdated).toISOString(), setlist_songs, encores, currentArtistId, setlist.tour.name, setlist_songs_infos, encores_infos, setlist.info, setlist.url], pool).catch(handleError);
        }
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