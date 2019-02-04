"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _keys = require("./keys");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var setlistFm = _axios.default.create({
  baseURL: 'https://api.setlist.fm/rest/1.0/search/artists',
  headers: {
    'x-api-key': _keys.ApiKey,
    Accept: 'application/json'
  }
});

function searchArtist(artistName) {
  return new Promise(function (resolve, reject) {
    setlistFm.get('?artistName=' + artistName).then(function (response) {
      var artists = response.data.artist;
      console.log(artistName);
      console.log(artists);
      resolve(artists);
    }).catch(function (err) {
      return reject(err);
    });
  });
}

var _default = searchArtist;
exports.default = _default;
//# sourceMappingURL=search_artist.js.map