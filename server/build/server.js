"use strict";

var _bluebird = require("bluebird");

var _express = _interopRequireDefault(require("express"));

var _load_setlists = _interopRequireDefault(require("./src/load_setlists"));

var _keys = require("./src/keys");

var _pg = require("pg");

var _search_artist = _interopRequireDefault(require("./src/search_artist"));

require("@babel/polyfill");

var _cors = _interopRequireDefault(require("cors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express.default)();
var pool = (0, _pg.Pool)(_keys.DbConfig);
app.use(_express.default.json());
app.use((0, _cors.default)({
  credentials: true,
  origin: true
}));
app.post('/artist/:artistId', function (req, res) {
  var artistId = req.params.artistId;
  (0, _load_setlists.default)(artistId, pool);
  return res.status(200).send("Downloading " + artistId + " data...");
});
app.get('/artist/:artistId/', function (req, res) {
  var artistId = req.params.artistId;
  return res.status(200).send("Ok");
});
app.get('/search/artists/:artistName',
/*#__PURE__*/
function () {
  var _ref = (0, _bluebird.coroutine)(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(req, res) {
    var artistName, artists;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            artistName = req.params.artistName;
            _context.next = 3;
            return (0, _search_artist.default)(artistName).catch(function (error) {
              return console.log(error);
            });

          case 3:
            artists = _context.sent;
            return _context.abrupt("return", res.status(200).send(artists));

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
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