import express from 'express';
import loadSetlists from "./src/load_setlists";
import {DbConfig} from "./src/keys";
import {Pool} from 'pg';
import searchArtist from "./src/search_artist";
import {getAllCovers, getAllOriginals, getAllSongs} from './src/database_queries';
import "@babel/polyfill";
import cors from 'cors';

const app = express();

const pool = Pool(DbConfig); app.use(express.json());

app.use(cors({
    credentials: true,
    origin: true,
}));

// Download data
app.post('/artist/:artistId', (req, res) => {
    const artistId = req.params.artistId;
    loadSetlists(artistId, pool);
    return res.status(200).send("Downloading " + artistId + " data...");
});

app.get('/artist/:artistId/', async (req, res) => {
    const artistId = req.params.artistId;
    let allSongs = [];
    let allOriginals = [];
    let allCovers = [];
    const promises = [
        getAllSongs(pool, artistId)
            .catch((error) => console.log(error))
            .then((songs) => {
                allSongs.push(...songs);
            }),
        getAllOriginals(pool, artistId)
            .catch((error) => console.log(error))
            .then((originals) => {
                allOriginals.push(...originals);
            }),
        getAllCovers(pool, artistId)
            .catch((error) => console.log(error))
            .then((covers) => {
                allCovers.push(...covers);
            })
    ];
    await Promise.all(promises);
    return res.status(200).send({
        songs: allSongs,
        covers: allCovers,
        originals: allOriginals,
    });
});

// Search for an artist
app.get('/search/artists/:artistName', async (req, res) => {
    const artistName = req.params.artistName;
    const artists = await searchArtist(artistName, pool).catch((error) => console.log(error));
    const sortArtists = (firstArtist, secondArtist) => {
        const first = firstArtist.name;
        const second = secondArtist.name;
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
    return res.status(200).send(artists);
});

app.get('/artist/:artistId/venue-locations', (req, res) => {
    const artistId = req.params.artistId;
    return res.status(200).send("Ok");
});

app.get('/artist/:artistId/typical-concert', (req, res) => {
    const artistId = req.params.artistId;
    return res.status(200).send("Ok");
});

app.get('/artist/:artistId/locations', (req, res) => {
    const artistId = req.params.artistId;
    return res.status(200).send("Ok");
});

app.get('/artist/:artistId/songs', (req, res) => {
    const artistId = req.params.artistId;
    return res.status(200).send("Ok");
});

app.get('/artist/:artistId/covers', (req, res) => {
    const artistId = req.params.artistId;
    return res.status(200).send("Ok");
});

app.get('/artist/:artistId/tours', (req, res) => {
    const artistId = req.params.artistId;
    return res.status(200).send("Ok");
});

app.get('/artist/:artistId/venues', (req, res) => {
    const artistId = req.params.artistId;
    return res.status(200).send("Ok");
});

app.get('/artist/:artistId/songs_by', (req, res) => {
    const artistId = req.params.artistId;
    return res.status(200).send("Ok");
});

const exitHandler = () => {
    pool.end();
    console.log("Exiting")
};

// process.on('exit', exitHandler);
// process.on('SIGINT', exitHandler);
// process.on('SIGUSR1', exitHandler);
// process.on('SIGUSR2', exitHandler);
// process.on('uncaughtException', exitHandler);

app.listen(3001);
console.log('app running on port.', 3001);
