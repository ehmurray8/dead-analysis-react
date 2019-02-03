import axios from 'axios';
import {ApiKey, DbConfig, DbPassword} from "./keys";
import {Client} from 'pg';


function loadSetlists(mbid) {
    console.log("Start");
    const setlistFm = axios.create({
        baseURL: 'https://api.setlist.fm/rest/1.0/artist/' + mbid + "/setlists",
        headers: {
            'x-api-key': ApiKey,
            Accept: 'application/json',
        },
    });

    function addSetlists(newSetlists) {
        if (newSetlists) {
            insertSetlistsIntoDatabase(newSetlists);
        }
    }

    setlistFm.get("/?p=1").then((response) => {
        const setlists = response.data.setlist;
        const itemsPerPage = response.data.itemsPerPage;
        const total = response.data.total;

        addSetlists(setlists.slice(0, 1));

        /*const lastPage = Math.ceil(total / itemsPerPage);
        let currentPage = 2;
        if (lastPage) {
            const handleError = () => {
                console.log("Setlist fm fetch error");
            };

            const intervalId = setInterval(() => {
                if (currentPage > lastPage) {
                    clearInterval(intervalId);
                    return;
                }
                setlistFm.get("/?p=" + currentPage)
                    .then((response) => addSetlists(response.data.setlist))
                    .catch((err) => handleError(err));
                currentPage += 1;
            }, 500);
        }*/
    }).catch((error) => console.log(error));
}


function insertSetlistsIntoDatabase(setlists) {
    const handleError = (err) => {
        console.log(err);
    };

    setlists.forEach((setlist) => {
        const artist = setlist.artist;
        const currentArtistId = artist.mbid;
        insertIntoTable("Artist", [artist.mbid, artist.name, artist.sortName, artist.tmid]).then(() => {
            const city = setlist.venue.city;
            const coordinates = city.coords;
            const country = city.country;
            insertIntoTable("City", [city.id, city.name, city.state, city.stateCode,
                    coordinates.long, coordinates.lat, country.code, country.name]).then(() => {
                const venue = setlist.venue;
                insertIntoTable("Venue", [venue.id, venue.name, city.id]).catch(handleError);

                const sets = setlist.sets.set;
                if (sets) {
                    const artistId = (song) => {
                        return (song && song.cover && song.cover.mbid) || currentArtistId;
                    };

                    const songToSongId = (song) => {
                        const name = song.name;
                        return artistId() + "==" + name;
                    };

                    const setlist_songs = [];
                    const setlist_songs_infos = [];
                    const encores = [];
                    const encores_infos = [];
                    sets.forEach((set) => {
                        const encore = set.encore;
                        if (encore) {
                            encores.push(...set.song.map(song => songToSongId(song)));
                            encores_infos.push(...set.song.map(song => song.info));
                        } else {
                            setlist_songs.push(set.song.map(song => songToSongId(song)));
                            setlist_songs_infos.push(set.song.map(song => song.info))
                        }

                        const songs = set.song;
                        songs.forEach(song => {
                            const name = song.name;
                            const songId = name.replace(" ", "_") + "==" + artistId();
                            if (artistId() !== currentArtistId) {
                                const coverArtistName = song.cover.name;
                                const coverArtistSortName = song.cover.sortName;
                                insertIntoTable('Artist', [currentArtistId, coverArtistName, coverArtistSortName]).then(() => {
                                    insertIntoTable('Song', [songId, name, artistId()]).catch(handleError);
                                }).catch(handleError);
                            } else {
                                insertIntoTable('Song', [songId, name, artistId()]).catch(handleError);
                            }
                        });
                    });

                    insertIntoTable('Setlist', [setlist.id, setlist.versionId, Date.parse(setlist.eventDate),
                        Date.parse(setlist.lastUpdated), setlist_songs, encores, currentArtistId, setlist.tour.name,
                        setlist_songs_infos, encores_infos]).catch(handleError);
                }
            }).catch(handleError);
        }).catch(handleError);
    });
}


function insertIntoTable(table, values) {
    const placeholders = values.map((x, index) => "$" + (index + 1).toString()).join();
    const client = new Client(DbConfig);

    return new Promise((resolve, reject) => {
        client.connect().then(() => {
            client.query('INSERT INTO "public"."' + table + '" VALUES (' + placeholders + ") ON CONFLICT DO NOTHING;", values, (queryError) => {
                client.end();
                if (queryError) {
                    reject(queryError);
                } else {
                    resolve();
                }
            });
        }).catch(() => console.log("Connection error"));
    });
}


export default loadSetlists;