import React, {Component} from 'react';
import {ListGroup} from "react-bootstrap";
import PropTypes from 'prop-types';


class SongsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
        this.reverse = false;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ ...nextProps });
    }

    render() {
        const headerStyle = {
            marginLeft: '10px',
            cursor: 'pointer',
        };
        const subHeaderStyle = {
            marginLeft: '25px',
        };
        const gridStyle = {
            cursor: 'pointer',
        };

        const flipList = () => {
            this.setState({
                ...this.state,
                songs: this.state.songs.reverse(),
            });
            this.reverse = !this.reverse;
        };

        const getIndex = (index) => {
            if (this.reverse) {
                return this.state.songs.length - index;
            } else {
                return index+1;
            }
        };

        return (
            <div key={this.state.identifier + "outer"} style={this.state.innerStyle}>
                { this.state.songs &&
                    <div>
                        <h2 style={headerStyle} onClick={flipList}>{this.state.identifier}</h2>
                        <h5 style={subHeaderStyle}>{"Number of songs: " + Number(this.state.songs.length).toLocaleString()}</h5>
                        <h5 style={subHeaderStyle}>{"Number of song plays: " + Number(this.state.totalSongPlays).toLocaleString()}</h5>
                        <ListGroup>
                            {  this.state.songs.map((song, index) => {
                                    return (
                                        <div key={song.name + this.state.identifier + "div"}>
                                            { song.artist_name &&
                                                <ListGroup.Item key={song.name + this.state.identifier + index} style={gridStyle}
                                                                onClick={() => this.state.showSongs(song.song_id)}>
                                                    {getIndex(index) + ". " + song.name + " (" + song.artist_name + "): " + Number(song.times_played).toLocaleString()}
                                                </ListGroup.Item>
                                            }
                                            { !song.artist_name &&
                                                <ListGroup.Item key={song.name + this.state.identifier + index} style={gridStyle}
                                                                onClick={() => this.state.showSongs(song.song_id)}>
                                                    {getIndex(index) + ". " + song.name + ": " + Number(song.times_played).toLocaleString()}
                                                </ListGroup.Item>
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
        song_id: PropTypes.string.isRequired,
        times_played: PropTypes.string.isRequired,
        artist_name: PropTypes.string,
    })),
    totalSongPlays: PropTypes.number,
    identifier: PropTypes.string.isRequired,
    showSongs: PropTypes.func,
};


export default SongsList;