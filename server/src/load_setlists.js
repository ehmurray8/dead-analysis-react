import axios from 'axios';
import {ApiKey} from "./keys";
import uuid from 'uuid/v4';


function loadSetlists(mbid, pool) {
    const setlistFm = axios.create({
        baseURL: 'https://api.setlist.fm/rest/1.0/artist/' + mbid + "/setlists",
        headers: {
            'x-api-key': ApiKey,
            Accept: 'application/json',
        },
    });

    function addSetlists(newSetlists) {
        if (newSetlists) {
            insertSetlistsIntoDatabase(newSetlists, pool);
        }
    }

    setlistFm.get("/?p=1").then((response) => {
        const setlists = response.data.setlist;
        const itemsPerPage = response.data.itemsPerPage;
        const total = response.data.total;

        addSetlists(setlists);

        const lastPage = Math.ceil(total / itemsPerPage);
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
        }
    }).catch((error) => console.log(error));
}


function insertSetlistsIntoDatabase(setlists, pool) {
    const handleError = (err) => {
        console.log(err);
    };

    setlists.forEach((setlist) => {
        const artist = setlist.artist;
        const currentArtistId = artist.mbid;
        console.log(setlist.id);
        insertIntoTable("Artist", [artist.mbid, artist.name, artist.sortName, artist.tmid], pool).then(() => {
            const city = setlist.venue.city;
            const coordinates = city.coords;
            const country = city.country;
            insertIntoTable("City", [city.id, city.name, city.state, city.stateCode,
                    coordinates.long, coordinates.lat, country.code, country.name], pool).then(() => {
                const venue = setlist.venue;
                insertIntoTable("Venue", [venue.id, venue.name, city.id], pool).catch(handleError).then(() =>{
                    const sets = setlist.sets.set;
                    if (sets) {
                        const songToArtistId = (song) => {
                            return (song && song.cover && song.cover.mbid) || currentArtistId;
                        };

                        const songToSongId = (song) => {
                            const name = song.name;
                            return name + "=!=" + songToArtistId(song);
                        };

                        let encoreIndex = 1;
                        sets.forEach((set, index) => {
                            const encore = set.encore;
                            const setId = uuid();
                            let setName;
                            if (encore) {
                                setName = "Encore " + encoreIndex;
                                encoreIndex += 1;
                            } else {
                                setName = "Set " + (index + 1);
                            }
                            insertIntoTable('Setlist', [setlist.id, setlist.versionId, eventDateToDate(setlist.eventDate),
                                    new Date(setlist.lastUpdated).toISOString(), currentArtistId, setlist.tour.name,
                                    setlist.info, setlist.url, venue.id], pool).catch(handleError).then(() => {
                                insertIntoTable('Set', [setId, setName, Boolean(encore), set.song.map(song => song.info), setlist.id], pool).catch(handleError).then(() => {
                                    const songs = set.song;
                                    songs.forEach(song => {
                                        const name = song.name;
                                        const songId = songToSongId(song);
                                        const artistId = songToArtistId(song);
                                        function addToSongAndSetSong() {
                                            insertIntoTable('Song', [songId, name, artistId], pool).catch(handleError).then(() => {
                                                insertIntoTable('Set_Song', [setId, songId], pool).catch(handleError);
                                            });
                                        }

                                        if (artistId !== currentArtistId) {
                                            const coverArtistName = song.cover.name;
                                            const coverArtistSortName = song.cover.sortName;
                                            insertIntoTable('Artist', [artistId, coverArtistName,
                                                coverArtistSortName, song.cover.tmid], pool).then(() => {
                                                    addToSongAndSetSong();
                                            }).catch(handleError);
                                        } else {
                                            addToSongAndSetSong();
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            }).catch(handleError);
        }).catch(handleError);
    });
}


function eventDateToDate(dateStr) {
    const [day, month, year] = dateStr.split("-");
    return new Date(year, month - 1, day).toISOString();
}


function insertIntoTable(table, values, pool) {
    const placeholders = values.map((x, index) => "$" + (index + 1).toString()).join();


    return new Promise((resolve, reject) => {
        pool.connect().then((client) => {
            client.query('INSERT INTO "public"."' + table + '" VALUES (' + placeholders + ") ON CONFLICT DO NOTHING;", values, (queryError) => {
                client.release();
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