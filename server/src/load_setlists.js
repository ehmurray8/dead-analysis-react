import axios from 'axios';
import {ApiKey} from "./keys";


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
                insertIntoTable("Venue", [venue.id, venue.name, city.id], pool).catch(handleError);

                const sets = setlist.sets.set;
                if (sets) {
                    const artistId = (song) => {
                        return (song && song.cover && song.cover.mbid) || currentArtistId;
                    };

                    const songToSongId = (song) => {
                        const name = song.name;
                        return artistId(song) + "==" + name;
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

                        let maxLength = 0;
                        setlist_songs.forEach(set_songs => {
                            if (set_songs.length > maxLength) {
                                maxLength = set_songs.length;
                            }
                        });

                        for (let i = 0; i < setlist_songs.length; i++) {
                            const setLength = setlist_songs[i].length;
                            if (setLength < maxLength) {
                                setlist_songs[i].push(...Array(maxLength - setLength).fill(null));
                                setlist_songs_infos[i].push(...Array(maxLength - setLength).fill(null));
                            }
                        }

                        const songs = set.song;
                        songs.forEach(song => {
                            const name = song.name;
                            const songId = name.replace(" ", "_") + "==" + artistId(song);
                            if (artistId(song) !== currentArtistId) {
                                const coverArtistName = song.cover.name;
                                const coverArtistSortName = song.cover.sortName;
                                insertIntoTable('Artist', [artistId(song), coverArtistName,
                                    coverArtistSortName, song.cover.tmid], pool).then(() => {
                                    insertIntoTable('Song', [songId, name, artistId(song)], pool).catch(handleError);
                                }).catch(handleError);
                            } else {
                                insertIntoTable('Song', [songId, name, artistId(song)], pool).catch(handleError);
                            }
                        });
                    });


                    insertIntoTable('Setlist', [setlist.id, setlist.versionId, eventDateToDate(setlist.eventDate),
                        new Date(setlist.lastUpdated).toISOString(), setlist_songs, encores, currentArtistId, setlist.tour.name,
                        setlist_songs_infos, encores_infos, setlist.info, setlist.url], pool).catch(handleError);
                }
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