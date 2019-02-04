import express from 'express';
import loadSetlists from "./src/load_setlists";
import {DbConfig} from "./src/keys";
import {Pool} from 'pg';
import searchArtist from "./src/search_artist";
import "@babel/polyfill";
import cors from 'cors';

const app = express();

const pool = Pool(DbConfig);

app.use(express.json());

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

app.get('/artist/:artistId/', (req, res) => {
    const artistId = req.params.artistId;
    return res.status(200).send("Ok");
});

// Search for an artist
app.get('/search/artists/:artistName', async (req, res) => {
    const artistName = req.params.artistName;
    const artists = await searchArtist(artistName).catch((error) => console.log(error));
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
