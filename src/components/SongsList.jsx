import React, {Component} from 'react';
import {ListGroup} from "react-bootstrap";
import PropTypes from 'prop-types';


class SongsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ ...nextProps });
    }

    render() {
        const headerStyle = {
            marginLeft: '5px',
        };
        const subHeaderStyle = {
            marginLeft: '25px',
        };
        return (
            <div style={this.state.innerStyle}>
                { this.state.songs &&
                    <div>
                        <h2 style={headerStyle}>{this.state.identifier}</h2>
                        <h5 style={subHeaderStyle}>{"Unique songs: " + Number(this.state.songs.length).toLocaleString()}</h5>
                        <h5 style={subHeaderStyle}>{"Total number of song plays: " + Number(this.state.totalSongPlays).toLocaleString()}</h5>
                        <ListGroup>
                            {  this.state.songs.map(song => {
                                    return (
                                        <div>
                                            { song.artist_name &&
                                                <ListGroup.Item key={song.name + this.state.identifier}>{song.name + " (" + song.artist_name + "): "
                                                    + Number(song.times_played).toLocaleString()}</ListGroup.Item>
                                            }
                                            { !song.artist_name &&
                                                <ListGroup.Item key={song.name + this.state.identifier}>{song.name + ": " + Number(song.times_played).toLocaleString()}</ListGroup.Item>
                                            }
                                        </div>
                                    );
                                })
                            }
                        </ListGroup>
                    </div>
                }
            </div>
        );
    }
}


SongsList.propTypes = {
    innerStyle: PropTypes.object.isRequired,
    songs: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        times_played: PropTypes.string.isRequired,
        artist_name: PropTypes.string,
    })),
    totalSongPlays: PropTypes.number,
    identifier: PropTypes.string.isRequired,
};


export default SongsList;