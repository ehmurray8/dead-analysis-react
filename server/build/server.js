"use strict";

var _bluebird = require("bluebird");

var _express = _interopRequireDefault(require("express"));

var _load_setlists = _interopRequireDefault(require("./src/load_setlists"));

var _keys = require("./src/keys");

var _pg = require("pg");

var _search_artist = _interopRequireDefault(require("./src/search_artist"));

var _database_queries = require("./src/database_queries");

require("@babel/polyfill");

var _cors = _interopRequireDefault(require("cors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var app = (0, _express.default)();
var pool = (0, _pg.Pool)(_keys.DbConfig);
app.use(_express.default.json());
app.use((0, _cors.default)({
  credentials: true,
  origin: true
})); // Download data

app.post('/artist/:artistId', function (req, res) {
  var artistId = req.params.artistId;
  (0, _load_setlists.default)(artistId, pool);
  return res.status(200).send("Downloading " + artistId + " data...");
});
app.get('/artist/:artistId/',
/*#__PURE__*/
function () {
  var _ref = (0, _bluebird.coroutine)(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(req, res) {
    var artistId, allSongs, allOriginals, allCovers, promises;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            artistId = req.params.artistId;
            allSongs = [];
            allOriginals = [];
            allCovers = [];
            promises = [(0, _database_queries.getAllSongs)(pool, artistId).catch(function (error) {
              return console.log(error);
            }).then(function (songs) {
              allSongs.push.apply(allSongs, _toConsumableArray(songs));
            }), (0, _database_queries.getAllOriginals)(pool, artistId).catch(function (error) {
              return console.log(error);
            }).then(function (originals) {
              allOriginals.push.apply(allOriginals, _toConsumableArray(originals));
            }), (0, _database_queries.getAllCovers)(pool, artistId).catch(function (error) {
              return console.log(error);
            }).then(function (covers) {
              allCovers.push.apply(allCovers, _toConsumableArray(covers));
            })];
            _context.next = 7;
            return Promise.all(promises);

          case 7:
            return _context.abrupt("return", res.status(200).send({
              songs: allSongs,
              covers: allCovers,
              originals: allOriginals
            }));

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()); // Search for an artist

app.get('/search/artists/:artistName',
/*#__PURE__*/
function () {
  var _ref2 = (0, _bluebird.coroutine)(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(req, res) {
    var artistName, artists, sortArtists;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            artistName = req.params.artistName;
            _context2.next = 3;
            return (0, _search_artist.default)(artistName, pool).catch(function (error) {
              return console.log(error);
            });

          case 3:
            artists = _context2.sent;

            sortArtists = function sortArtists(firstArtist, secondArtist) {
              var first = firstArtist.name;
              var second = secondArtist.name;

              if (first === artistName) {
                return -1;
              } else if (second === artistName) {
                return 1;
              } else if (first.hasData && second.hasData) {
                return first.localeCompare(second);
              } else if (first.hasData) {
                return -1;
              } else if (second.hasData) {
                return 1;
              } else {
                return first.localeCompare(first);
              }
            };

            artists.sort(sortArtists);
            return _context2.abrupt("return", res.status(200).send(artists));

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
app.get('/artist/:artistId/venue-locations', function (req, res) {
  var artistId = req.params.artistId;
  return res.status(200).send("Ok");
});
app.get('/artist/:artistId/typical-concert', function (req, res) {
  var artistId = req.params.artistId;
  return res.status(200).send("Ok");
});
app.get('/artist/:artistId/locations', function (req, res) {
  var artistId = req.params.artistId;
  return res.status(200).send("Ok");
});
app.get('/artist/:artistId/songs', function (req, res) {
  var artistId = req.params.artistId;
  return res.status(200).send("Ok");
});
app.get('/artist/:artistId/covers', function (req, res) {
  var artistId = req.params.artistId;
  return res.status(200).send("Ok");
});
app.get('/artist/:artistId/tours', function (req, res) {
  var artistId = req.params.artistId;
  return res.status(200).send("Ok");
});
app.get('/artist/:artistId/venues', function (req, res) {
  var artistId = req.params.artistId;
  return res.status(200).send("Ok");
});
app.get('/artist/:artistId/songs_by', function (req, res) {
  var artistId = req.params.artistId;
  return res.status(200).send("Ok");
});

var exitHandler = function exitHandler() {
  pool.end();
  console.log("Exiting");
}; // process.on('exit', exitHandler);
// process.on('SIGINT', exitHandler);
// process.on('SIGUSR1', exitHandler);
// process.on('SIGUSR2', exitHandler);
// process.on('uncaughtException', exitHandler);


app.listen(3001);
console.log('app running on port.', 3001);
//# sourceMappingURL=server.js.map