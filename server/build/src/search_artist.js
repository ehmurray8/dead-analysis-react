"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bluebird = require("bluebird");

var _axios = _interopRequireDefault(require("axios"));

var _keys = require("./keys");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var setlistFm = _axios.default.create({
  baseURL: 'https://api.setlist.fm/rest/1.0/search/artists',
  headers: {
    'x-api-key': _keys.ApiKey,
    Accept: 'application/json'
  }
});

function searchArtist(artistName, pool) {
  return new Promise(function (resolve, reject) {
    setlistFm.get('?artistName=' + artistName).then(function (response) {
      var artists = response.data.artist;
      console.log(artists);

      try {
        artists = Promise.all(artists.map(
        /*#__PURE__*/
        function () {
          var _ref = (0, _bluebird.coroutine)(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee(artist) {
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.t0 = _objectSpread;
                    _context.t1 = {};
                    _context.t2 = artist;
                    _context.next = 5;
                    return dataLoaded(artist, pool);

                  case 5:
                    _context.t3 = _context.sent;
                    _context.t4 = {
                      hasData: _context.t3
                    };
                    return _context.abrupt("return", (0, _context.t0)(_context.t1, _context.t2, _context.t4));

                  case 8:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }()));
      } catch (err) {
        console.log(err);
        return artists;
      }

      resolve(artists);
    }).catch(function (err) {
      return reject(err);
    });
  });
}

function dataLoaded(artist, pool) {
  return new Promise(function (resolve, reject) {
    pool.connect().then(function (client) {
      client.query('SELECT DISTINCT artist_id FROM "public"."Setlist"', function (queryError, response) {
        client.release();

        if (queryError) {
          reject(queryError);
        } else {
          var results = response.rows.map(function (row) {
            return row.artist_id;
          });
          resolve(results.includes(artist.mbid));
        }
      });
    }).catch(function () {
      return console.log("Connection error");
    });
  });
}

var _default = searchArtist;
exports.default = _default;
//# sourceMappingURL=search_artist.js.map