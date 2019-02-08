import React, {Component} from 'react';
import ListGroup from "react-bootstrap/ListGroup";
import axios from 'axios';
import {Redirect} from "react-router-dom";


const backendSearch = axios.create({
    baseURL: 'http://localhost:3001/search/artists',
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});


const loadData = axios.create({
    baseURL: 'http://localhost:3001/artist',
    headers: {
        'Access-Control-Allow-Origin': '*',
    },
});


class ArtistSearch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    }

    loadArtist(artist) {
        if (!this.state.reload) {
            this.setState({
                ...this.state,
                reload: true,
                artist: artist,
            });
        }
    }

    redirect() {
        if (this.state.reload) {
            const artist = this.state.artist;
            console.log(artist);
            if (!artist.hasData) {
                loadData.post('/artist/' + artist.mbid);
                this.history.push({
                    pathname: '/artists',
                    state: {
                        loadingName: artist.name,
                    },
                });
            } else {
                return (<Redirect to={'/artists/' + artist.mbid}/>)
            }
        }
    }

    render() {
        this.artistName = encodeURIComponent(this.props.match.params.artistName);
        backendSearch.get('/' + this.artistName)
            .then(data => this.setState({
                ...this.state,
                results: data.data
        }));

        return (
            <div>
                {this.redirect()}
                { this.state.results &&
                    <ListGroup>
                        { this.state.results.map(element => {
                            return <ListGroup.Item key={element.name} onClick={() => this.loadArtist(element)}
                                style={{cursor: 'pointer'}}>{element.name}</ListGroup.Item>;
                        })}
                   </ListGroup>
                }
            </div>
        );
    }
}


export default ArtistSearch;