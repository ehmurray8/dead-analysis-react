import React, {Component} from 'react';
import ListGroup from "react-bootstrap/ListGroup";
import axios from 'axios';


const backendSearch = axios.create({
    baseURL: 'http://localhost:3001/search/artists',
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});


class ArtistSearch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    }

    loadArtist(element) {
        // this.props.history.replace('/search/artists/' + element.mbid);
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
                { this.state.results &&
                    <ListGroup>
                        { this.state.results.map(element => {
                            return <ListGroup.Item key={element.name} onclick={(element) => this.loadArtist(element)}>{element.name}</ListGroup.Item>;
                        })}
                   </ListGroup>
                }
            </div>
        );
    }
}


export default ArtistSearch;