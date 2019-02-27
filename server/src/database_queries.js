export function getAllSongs(pool, artistId) {
    return query(pool, `
        SELECT "Song".name as name, COUNT(*) as times_played, "Song".id as song_id
        FROM "Song", (
            SElECT "Set_Song".song_id as id
            FROM "Set_Song", (
                SELECT "Set".id
                FROM "Set", (
                    SELECT "Setlist".id as id
                    FROM "Setlist"
                    WHERE "Setlist".artist_id = '${artistId}') as artists_setlists
                WHERE "Set".setlist_id = artists_setlists.id) as set_ids
            WHERE set_ids.id = "Set_Song".set_id ) as song_ids
        WHERE "Song".id = song_ids.id
        GROUP BY name, song_id
        ORDER BY times_played DESC
    `);
}


export function getAllOriginals(pool, artistId) {
    return query(pool, `
        SELECT "Song".name as name, COUNT(*) as times_played, "Song".id as song_id
        FROM "Song", (
            SElECT "Set_Song".song_id as id
            FROM "Set_Song", (
                SELECT "Set".id
                FROM "Set", (
                    SELECT "Setlist".id as id
                    FROM "Setlist"
                    WHERE "Setlist".artist_id = '${artistId}') as artists_setlists
                WHERE "Set".setlist_id = artists_setlists.id) as set_ids
            WHERE set_ids.id = "Set_Song".set_id ) as song_ids
        WHERE "Song".id = song_ids.id AND "Song".artist_id = '${artistId}'
        GROUP BY name, song_id
        ORDER BY times_played DESC
    `);
}


export function getAllCovers(pool, artistId) {
    return query(pool, `
    SELECT name_ids.name as name, "Artist".name as artist_name, name_ids.times_played, name_ids.song_id as song_id
    FROM "Artist", (
        SELECT "Song".name as name, "Song".artist_id as artist_id, COUNT(*) as times_played, "Song".id as song_id
        FROM "Song", (
            SElECT "Set_Song".song_id as id
            FROM "Set_Song", (
                SELECT "Set".id
                FROM "Set", (
                    SELECT "Setlist".id as id
                    FROM "Setlist"
                    WHERE "Setlist".artist_id = '${artistId}' 
                ) as artists_setlists
                WHERE "Set".setlist_id = artists_setlists.id) as set_ids
            WHERE set_ids.id = "Set_Song".set_id ) as song_ids
        WHERE "Song".id = song_ids.id AND "Song".artist_id != '${artistId}'
        GROUP BY name, artist_id, song_id
        ORDER BY times_played DESC) as name_ids
    WHERE "Artist".mbid = name_ids.artist_id
    `);
}


export function getAllSetlistsBySong(pool, songId, artistId) {
    songId = songId.replace(/'/g, "''");
    return query(pool, `
        SELECT venue_info.event_date, venue_info.tour_name, venue_info.id, venue_info.venue_name, "City".name as city_name, "City".state, "City".country_name
        FROM "City", (
            SELECT setlist_info.event_date, setlist_info.tour_name, setlist_info.id, "Venue".name as venue_name, "Venue".city_id
            FROM "Venue", (
                SELECT "Setlist".event_date, "Setlist".tour_name, "Setlist".venue_id, "Setlist".id
                FROM "Setlist", (
                    SELECT "Set".setlist_id as setlist_id
                    FROM "Set", (
                        SELECT "Set_Song".set_id as set_id
                        FROM "Set_Song"
                        WHERE "Set_Song".song_id = '${songId}') as set_ids
                    WHERE set_ids.set_id = "Set".id) as setlist_ids
                WHERE "Setlist".id = setlist_ids.setlist_id AND "Setlist".artist_id = '${artistId}') as setlist_info
            WHERE "Venue".id = setlist_info.venue_id) as venue_info
        WHERE "City".id = venue_info.city_id
        ORDER BY venue_info.event_date DESC
    `);
}


export function getSetlistInfo(pool, setlistId) {
    return query(pool, `
        SELECT "Song".name as song_name, "Artist".name as song_artist_name, songs.event_date, songs.tour_name, songs.url, songs.name as set_name, songs.infos, songs.artist_name, songs.city_name,
            songs.state, songs.country_name, songs.venue_name, songs.info, songs.latitude, songs.longitude, songs.song_id
        FROM "Song", "Artist", (
            SELECT "Set_Song".song_id, infos.*
            FROM "Set_Song", (
                SELECT set_infos.*, "Artist".name as artist_name, "Venue".name as venue_name, "City".name as city_name, "City".state, "City".country_name, "City".latitude, "City".longitude
                FROM "Artist", "Venue", "City", (
                    SELECT sets_setlists.*
                    FROM "Venue", (
                        SELECT setlist.event_date, setlist.artist_id, setlist.tour_name, setlist.info, setlist.url, setlist.venue_id, "Set".id as set_id, "Set".*
                        FROM "Set", (
                            SELECT * 
                            FROM "Setlist" 
                            WHERE "Setlist".id = '${setlistId}') as setlist
                        WHERE "Set".setlist_id = setlist.id) as sets_setlists
                    WHERE "Venue".id = sets_setlists.venue_id) as set_infos
                WHERE "Artist".mbid = set_infos.artist_id AND "Venue".id = set_infos.venue_id AND "Venue".city_id = "City".id) as infos
            WHERE "Set_Song".set_id = infos.set_id) as songs
        WHERE "Song".id = songs.song_id AND "Song".artist_id = "Artist".mbid
    `);
}


function query(pool, queryString) {
    return new Promise((resolve, reject) => {
        pool.connect().then((client) => {
            client.query(queryString, (queryError, response) => {
                client.release();
                if (queryError) {
                    reject(queryError);
                } else {
                    const results = response.rows;
                    resolve(results);
                }
            });
        }).catch(() => console.log("Connection error"));
    });
}
