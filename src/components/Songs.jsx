import React, {Component} from 'react';
import axios from 'axios';
import SongsList from "./SongsList";


const backendQuery = axios.create({
    baseURL: 'http://localhost:3001/artist/',
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});


class Songs extends Component {
   _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    }

    componentDidMount() {
        this._isMounted = true;
        const artistId = this.state.match.params.artistId;
        backendQuery.get(artistId).then((data) => {
             if (this._isMounted) {
                 this.setState({
                     ...this.state,
                     songs: data.data.songs,
                     originals: data.data.originals,
                     covers: data.data.covers,
                 });
             }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const innerStyle = {
            width: "33%",
            float: "left"
        };

        const totalSongPlays = this.state.songs && this.state.songs.reduce((previous, current) => { return previous + parseInt(current.times_played)}, 0);
        const totalCoverPlays = this.state.covers && this.state.covers.reduce((previous, current) => { return previous + parseInt(current.times_played)}, 0);
        const totalOriginalPlays = this.state.originals && this.state.originals.reduce((previous, current) => { return previous + parseInt(current.times_played)}, 0);

        return (
            <div>
                <SongsList innerStyle={innerStyle} songs={this.state.songs} identifier={"All Songs"} totalSongPlays={totalSongPlays}/>
                <SongsList innerStyle={innerStyle} songs={this.state.originals} identifier={"All Originals"} totalSongPlays={totalOriginalPlays}/>
                <SongsList innerStyle={innerStyle} songs={this.state.covers} identifier={"All Covers"} totalSongPlays={totalCoverPlays}/>
            </div>
        );
    }
}


export default Songs;