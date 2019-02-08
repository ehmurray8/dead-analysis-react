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
        return (
            <div style={this.state.innerStyle}>
                { this.state.songs &&
                    <div>
                        <h2>{this.state.identifier + ":" + this.state.songs.length + "/" + this.state.totalSongPlays}</h2>
                        <ListGroup>
                            {  this.state.songs.map(song => {
                                    return (
                                        <ListGroup.Item key={song.name}>{song.name + ": " + song.times_played}</ListGroup.Item>
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
    })),
    totalSongPlays: PropTypes.number,
    identifier: PropTypes.string.isRequired,
};


export default SongsList;