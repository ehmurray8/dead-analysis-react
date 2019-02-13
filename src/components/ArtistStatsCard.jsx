import React, {Component} from 'react';
import Card from "react-bootstrap/Card";
import PropTypes from 'prop-types';

class ArtistStatsCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ...props,
        };
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
            <Card bg="dark" text="white" style={cardStyle} className="text-center" onClick={() => this.state.callback()}>
                <Card.Body>
                    <br/>
                    <br/>
                    <Card.Title style={titleStyle}>{this.state.title}</Card.Title>
                </Card.Body>
            </Card>
        );
    }
}


ArtistStatsCard.propTypes = {
    title: PropTypes.string.isRequired,
    callback: PropTypes.func,
};


export default ArtistStatsCard;
