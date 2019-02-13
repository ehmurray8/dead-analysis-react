import React from 'react';


const Artists = (props) => {
    const loadingName = props.location && props.location.state && props.location.state.loadingName;
    return (
        <div>
            <h1>Artists Page</h1>
            { loadingName &&
                <h3>{"Loading Artist " + loadingName + ". Please wait a few minutes and navigate back to the artist's page."}</h3>
            }
        </div>
    );
};


export default Artists;
