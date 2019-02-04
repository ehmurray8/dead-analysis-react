import axios from 'axios';
import {ApiKey} from './keys';


const setlistFm = axios.create({
    baseURL: 'https://api.setlist.fm/rest/1.0/search/artists',
    headers: {
        'x-api-key': ApiKey,
        Accept: 'application/json',
    },
});


function searchArtist(artistName) {
    return new Promise((resolve, reject) => {
        setlistFm.get('?artistName=' + artistName).then((response) => {
            const artists = response.data.artist;
            console.log(artistName);
            console.log(artists);
            resolve(artists);
        }).catch((err) => reject(err));
    });
}


export default searchArtist;
