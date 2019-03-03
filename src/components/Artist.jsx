import React, {Component} from 'react';
import ArtistStatsCard from "./ArtistStatsCard";
import axios from 'axios';


const backendSearch = axios.create({
    baseURL: 'http://localhost:3001/artist/',
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});


class Artist extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            ...props,
        };
        this.artistId = this.state.match.params.artistId;
    }

    componentDidMount() {
        this._isMounted = true;
        backendSearch.get(`${this.artistId}/name`).then((data) => {
            if (this._isMounted) {
                this.setState({
                    ...this.state,
                    artistName: data.data,
                })
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    showSongs() {
        this.state.history.push('/artists/' + this.artistId + "/songs");
    }

    showLocations() {
        this.state.history.push('/artists/' + this.artistId + '/locations');
    }

    render() {
        const headerStyle = {
            margin: '20px',
        };

        return (
            <div>
                <h1 style={headerStyle}>{this.state.artistName}</h1>
                <ArtistStatsCard title="Songs" callback={() => this.showSongs()}/>
                <ArtistStatsCard title="Locations" callback={() => this.showLocations()}/>
            </div>
        );
    }
}


export default Artist;