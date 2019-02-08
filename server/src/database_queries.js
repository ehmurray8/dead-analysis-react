export function getAllSongs(pool, artistId) {
    return query(pool, `
        SELECT "Song".name as name, COUNT(*) as times_played
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
        GROUP BY name
        ORDER BY times_played DESC
    `);
}


export function getAllOriginals(pool, artistId) {
    return query(pool, `
        SELECT "Song".name as name, COUNT(*) as times_played
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
        GROUP BY name
        ORDER BY times_played DESC
    `);
}


export function getAllCovers(pool, artistId) {
    return query(pool, `
        SELECT "Song".name as name, COUNT(*) as times_played
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
        GROUP BY name
        ORDER BY times_played DESC
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
