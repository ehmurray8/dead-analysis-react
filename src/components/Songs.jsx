import React, {Component} from 'react';
import axios from 'axios';
import SongsList from "./SongsList";
import Breadcrumb from "react-bootstrap/es/Breadcrumb";
import BreadcrumbItem from "react-bootstrap/BreadcrumbItem";
import {backendNameSearch} from "../constants";


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
        this.artistId = this.state.match.params.artistId;
    }

    componentDidMount() {
        this._isMounted = true;
        backendQuery.get(this.artistId).then((data) => {
             if (this._isMounted) {
                 this.setState({
                     ...this.state,
                     songs: data.data.songs,
                     originals: data.data.originals,
                     covers: data.data.covers,
                 });
             }
        });

        backendNameSearch.get(`${this.artistId}/name`).then((data) => {
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

    showSongDetails(songId) {
        const encodedSongId = encodeURIComponent(songId);
        this.state.history.push('/artists/' + this.artistId + "/songs/" + encodedSongId);
    }

    render() {
        const innerStyle = {
            width: "33.333333%",
            float: "left"
        };

        const totalSongPlays = this.state.songs && this.state.songs.reduce((previous, current) => { return previous + parseInt(current.times_played)}, 0);
        const totalCoverPlays = this.state.covers && this.state.covers.reduce((previous, current) => { return previous + parseInt(current.times_played)}, 0);
        const totalOriginalPlays = this.state.originals && this.state.originals.reduce((previous, current) => { return previous + parseInt(current.times_played)}, 0);

        const breadCrumbStyle = {
            position: 'fixed',
            top: '55px',
            left: 0,
            right: 0,
            display: 'block',
            zIndex: 2000,
        };

        return (
            <div>
                <Breadcrumb style={breadCrumbStyle}>
                    <BreadcrumbItem href={"/artists/" + this.artistId}>{this.state.artistName || "Artist Home"}</BreadcrumbItem>
                </Breadcrumb>
                <h1 style={{textAlign: 'center', display: 'block'}}>{this.state.artistName}</h1>
                <div>
                    <SongsList innerStyle={innerStyle} songs={this.state.songs} identifier={"All songs played"}
                               totalSongPlays={totalSongPlays} showSongs={(songId) => this.showSongDetails(songId)}/>
                    <SongsList innerStyle={innerStyle} songs={this.state.originals} identifier={"Originals"}
                               totalSongPlays={totalOriginalPlays} showSongs={(songId) => this.showSongDetails(songId)}/>
                    <SongsList innerStyle={innerStyle} songs={this.state.covers} identifier={"Covers"}
                               totalSongPlays={totalCoverPlays} showSongs={(songId) => this.showSongDetails(songId)}/>
                </div>
            </div>
        );
    }
}


export default Songs;