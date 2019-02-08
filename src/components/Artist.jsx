import React, {Component} from 'react';
import {Card} from "react-bootstrap";


class Artist extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ...props,
        };
        this.artistId = this.state.match.params.artistId;
    }

    showSongs() {
        this.state.history.push('/artists/' + this.artistId + "/songs");
    }

    render() {
        const width = (window.innerWidth * .2);
        const height = width * .75;

        const cardStyle = {
            width: width + "px",
            height: height + "px",
            marginTop: "25px",
            marginLeft: "25px",
            marginBottom: "25px",
            cursor: "pointer",
            float: "left",
        };

        const titleStyle = {
            textAlign: "center",
            fontSize: "50px",
        };

        return (
            <div>
                <Card bg="dark" text="white" style={cardStyle} className="text-center" onClick={() => this.showSongs()}>
                    <Card.Body>
                        <br/>
                        <br/>
                        <Card.Title style={titleStyle}>Songs</Card.Title>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}


export default Artist;