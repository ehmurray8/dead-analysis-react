import React from 'react';


const Artist = (props) => {

    const artistId = parseInt(props.match.params.artistId, 10);

    return (
        <div>
            { Number.isInteger(artistId) &&
                <h1>{artistId}</h1>
            }
            { !artistId &&
                <h1>Artist not found</h1>
            }
        </div>

    )
};


export default Artist;