import React, {Component} from 'react';
import ListGroup from "react-bootstrap/ListGroup";
import axios from 'axios';
import Breadcrumb from "react-bootstrap/Breadcrumb";
import BreadcrumbItem from "react-bootstrap/BreadcrumbItem";
import {backendNameSearch, weekDays} from "../constants";


const backendQuery = axios.create({
    baseURL: 'http://localhost:3001/artist/',
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});


class SongDetails extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            ...props,
        };
        this.artistId = this.state.match.params.artistId;
        this.songId = this.state.match.params.songId;
        this.decodedId = decodeURIComponent(this.songId).split("=!=");
        this.songName = this.decodedId[0];
        this.songArtistId = this.decodedId[1];
        this.allSetlists = [];
        this.decadeString = null;
    }

    componentDidMount() {
        this._isMounted = true;
        backendQuery.get(this.artistId + "/song/" + this.songId).then((data) => {
            if (this._isMounted) {
                this.allSetlists.push(...data.data);
                this.setState({
                    ...this.state,
                    setlists: data.data,
                })
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

        backendNameSearch.get(`${this.songArtistId}/name`).then((data) => {
            if (this._isMounted) {
                this.setState({
                    ...this.state,
                    songArtistName: data.data,
                })
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    showSetlist(setlistId) {
        this.state.history.push(`/artists/${this.artistId}/songs/${this.songId}/setlists/${setlistId}`);
    }

    render() {
        const headerStyle = {
            margin: '10px',
        };
        const itemStyle = {
            cursor: 'pointer',
        };

        const setlistInfo = (setlist) => {
            let stateCountryString;
            if (setlist.state) {
                stateCountryString = setlist.state + ", " + setlist.country_name;
            } else {
                stateCountryString = setlist.country_name;
            }

            const dateStyle = {
                fontWeight: 'bold',
                float: 'left',
                width: '100px',
            };
            const outerStyle = {
                float: 'left',
            };
            const paragraphStyle = {
                marginLeft: '15px',
            };

            const eventDate = new Date(setlist.event_date);
            const dateString = eventDate.toLocaleDateString();
            const dayOfWeek = weekDays[eventDate.getDay()];

            let tourName;
            if (setlist.tour_name === "No Tour Assigned") {
                tourName = "Solo Concert";
            } else {
                tourName = setlist.tour_name + " Tour";
            }

            return (
                <div>
                    <p style={dateStyle}>{dayOfWeek + ", " + dateString}</p>
                    <div style={outerStyle}>
                        <p style={paragraphStyle}>{tourName}</p>
                        <p style={paragraphStyle}>{setlist.venue_name + ", " + setlist.city_name + ", " + stateCountryString}</p>
                    </div>
                </div>);
        };

        const breadCrumbStyle = {
            position: 'sticky',
            top: '55px',
            display: 'block',
            zIndex: 100,
        };

        const decades = this.allSetlists && Array(...new Set(this.allSetlists.map(setlist => Math.floor(new Date(setlist.event_date).getFullYear() / 10))));
        const decadeStrings = decades && decades.map(element => {
            return element.toString() + "0s";
        });

        const filterSetlists = (decadeString) => {
            const decade = Number(decadeString.substring(0, decadeString.length - 1)) / 10;
            const setlists = this.allSetlists.filter((setlist) => new Date(setlist.event_date).getFullYear().toString(10).includes(decade.toString(10)));
            this.decadeString = decadeString;
            this.setState({
                ...this.state,
                setlists: setlists,
            });
        };

        const showAllSetlists = () => {
            this.decadeString = "";
            this.setState({
                ...this.state,
                setlists: this.allSetlists,
            })
        };

        const createDecadeButton = (decadeString) => {
            const decadeButtonStyle = {
                float: 'right',
                cursor: 'pointer',
                marginRight: '20px',
            };
            if (decadeString === this.decadeString) {
                decadeButtonStyle.color = 'blue';
            }
            return <p key={decadeString} onClick={() => filterSetlists(decadeString)} style={decadeButtonStyle}>{decadeString}</p>
        };

        const allStyle = {
            float: 'right',
            cursor: 'pointer',
            marginRight: '20px',
        };

        if (!this.decadeString) {
            allStyle.color = 'blue';
        }

        return (
            <div>
                <Breadcrumb style={breadCrumbStyle}>
                    <BreadcrumbItem href={"/artists/" + this.artistId}>{this.state.artistName || "Artist Home"}</BreadcrumbItem>
                    <BreadcrumbItem href={"/artists/" + this.artistId + "/songs"}>Songs</BreadcrumbItem>
                    <BreadcrumbItem href={"#top"}>{this.songName}</BreadcrumbItem>
                </Breadcrumb>
                <div style={{display: 'inline-block', float: 'right'}}>
                    <p key={"All"} onClick={() => showAllSetlists()} style={allStyle}>All</p>
                    { decadeStrings && decadeStrings.map((str) =>
                        createDecadeButton(str)
                    )}
                </div>
                <h2 style={headerStyle}>{this.songName + " by " + (this.state.songArtistName || "")}</h2>
                <h5 style={{marginLeft: '25px', color: 'gray'}}>{"Played at " + ((this.state.setlists && this.state.setlists.length) || "") + " concerts"}</h5>
                { this.state.setlists &&
                    <ListGroup>
                        { this.state.setlists.map((setlist, index) => {
                              return <ListGroup.Item key={setlist.id + index} style={itemStyle} onClick={() => this.showSetlist(setlist.id)}>
                                  {setlistInfo(setlist)}
                              </ListGroup.Item>
                          })
                        }
                    </ListGroup>
                }
            </div>
        )
    }
}


export default SongDetails;
