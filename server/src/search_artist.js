import axios from 'axios';
import {ApiKey} from './keys';


const setlistFm = axios.create({
    baseURL: 'https://api.setlist.fm/rest/1.0/search/artists',
    headers: {
        'x-api-key': ApiKey,
        Accept: 'application/json',
    },
});


function searchArtist(artistName, pool) {
    return new Promise((resolve, reject) => {
        setlistFm.get('?artistName=' + artistName).then((response) => {
            let artists = response.data.artist;
            console.log(artists);
            try {
                artists = Promise.all(artists.map(async (artist) => {
                    return {
                        ...artist,
                        hasData: await dataLoaded(artist, pool)
                    }
                }));
            } catch (err) {
                console.log(err);
                return artists;
            }
            resolve(artists);
        }).catch((err) => reject(err));
    });
}


function dataLoaded(artist, pool) {
    return new Promise((resolve, reject) => {
        pool.connect().then((client) => {
            client.query('SELECT DISTINCT artist_id FROM "public"."Setlist"', (queryError, response) => {
                client.release();
                if (queryError) {
                    reject(queryError);
                } else {
                    const results = response.rows.map(row => row.artist_id);
                    resolve(results.includes(artist.mbid));
                }
            });
        }).catch(() => console.log("Connection error"));
    });
}


export default searchArtist;
