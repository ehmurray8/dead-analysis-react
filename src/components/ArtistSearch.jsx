import React, {Component} from 'react';
import ListGroup from "react-bootstrap/ListGroup";
import axios from 'axios';


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

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    }
    redirect(artist) {
        if (!artist.hasData) {
            loadData.post("/" + artist.mbid);
            this.state.history.push({
                pathname: '/artists',
                state: {
                    loadingName: artist.name,
                },
            });
        } else {
            this.state.history.push('/artists/' + artist.mbid);
        }
    }

    componentDidMount() {
        this._isMounted = true;
        backendSearch.get('/' + this.artistName).then(data => {
            if (this._isMounted) {
                this.setState({
                    ...this.state,
                    results: data.data
                })
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        this.artistName = encodeURIComponent(this.props.match.params.artistName);
        const style = {
            cursor: 'pointer',
        };
        return (
            <div>
                { this.state.results &&
                    <ListGroup>
                        { this.state.results.map(artist => {
                            return (
                                <ListGroup.Item key={artist.name} onClick={() => this.redirect(artist)}
                                                style={style}>{artist.name}</ListGroup.Item>
                            );
                        })}
                   </ListGroup>
                }
            </div>
        );
    }
}


export default ArtistSearch;