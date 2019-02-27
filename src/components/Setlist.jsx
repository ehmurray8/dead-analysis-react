import React, {Component} from 'react';
import BreadcrumbItem from "react-bootstrap/BreadcrumbItem";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import axios from 'axios';
import {backendNameSearch} from "../constants";
import {locationIQKey, mapBoxGLKey} from "../keys";
import * as mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'


mapboxgl.accessToken = mapBoxGLKey;


export const backendSetlistQuery = axios.create({
    baseURL: 'http://localhost:3001/setlist/',
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});


class Setlist extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            ...props,
        };
        this.artistId = this.state && this.state.match && this.state.match.params && this.state.match.params.artistId;
        this.songId = this.state && this.state.match && this.state.match.params && this.state.match.params.songId;
        this.setlistId = this.state && this.state.match && this.state.match.params && this.state.match.params.setlistId;

        const decodedSongId = this.songId && decodeURIComponent(this.songId).split("=!=");
        this.songName = decodedSongId && decodedSongId[0];
        this.songArtistId = decodedSongId && decodedSongId[1]
    }

    componentDidMount() {
        this._isMounted = true;

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

        backendSetlistQuery.get(`${this.setlistId}`).then((data) => {
            if (this._isMounted) {
                data.data.sort((e1, e2) => {
                    const first = e1.set_name;
                    const second = e2.set_name;
                    if (first.includes("Set") && second.includes("Set")) {
                        return first.localeCompare(second);
                    } else if (first.includes("Set")) {
                        return -1;
                    } else if (second.includes("Set")) {
                        return 1;
                    } else {
                        return first.localeCompare(second);
                    }
                });
                let tourName = data.data[0].tour_name;
                if (tourName === "No Tour Assigned") {
                    tourName = "Solo Concert";
                }
                this.setState({
                    ...this.state,
                    setlists: data.data,
                    artistName: data.data[0].artist_name,
                    eventDate: new Date(data.data[0].event_date),
                    tourName: tourName,
                    setlistUrl: data.data[0].url,
                    cityName: data.data[0].city_name,
                    state: data.data[0].state,
                    country: data.data[0].country_name,
                    venueName: data.data[0].venue_name,
                    url: data.data[0].url,
                    info: data.data[0].info,
                });
                this.showMap();
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    showMap() {
        const searchString = this.state.venueName + ", " + this.countryState();
        axios.get(`https://us1.locationiq.com/v1/search.php?key=${locationIQKey}&q=${searchString}&format=json`).then((res) => {
            console.log(res);
            if (res && res.data) {
                const longitude = res.data[0].lon;
                const latitude = res.data[0].lat;
                this.setState({
                    ...this.state,
                    longitude: longitude,
                    latitude: latitude,
                });
                const map = new mapboxgl.Map({
                    container: 'mapContainer',
                    style: 'mapbox://styles/mapbox/streets-v11',
                    zoom: 6,
                    center: [longitude, latitude],
                });

                const popUp = new mapboxgl.Popup({offset: 25}).setText(this.state.venueName);

                new mapboxgl.Marker().setLngLat([longitude, latitude]).setPopup(popUp).addTo(map);

                map.on('load', () => {
                    // Insert the layer beneath any symbol layer.
                    let layers = map.getStyle().layers;

                    let labelLayerId;
                    for (let i = 0; i < layers.length; i++) {
                        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                            labelLayerId = layers[i].id;
                            break;
                        }
                    }

                    map.addLayer({
                        'id': '3d-buildings',
                        'source': 'composite',
                        'source-layer': 'building',
                        'filter': ['==', 'extrude', 'true'],
                        'type': 'fill-extrusion',
                        'minzoom': 15,
                        'paint': {
                            'fill-extrusion-color': '#aaa',
                            'fill-extrusion-height': ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "height"]],
                            'fill-extrusion-base': ["interpolate", ["linear"], ["zoom"], 15, 0, 15.05, ["get", "min_height"]],
                            'fill-extrusion-opacity': .6
                        }
                    }, labelLayerId);
                });
            }
        });
    }

    countryState() {
        let countryState;
        if (this.state.state) {
            countryState = this.state.cityName + ", " + this.state.state + ", " + this.state.country;
        } else {
            countryState = this.state.cityName + ", " + this.state.country;
        }
        return countryState;
    }

    render() {
        const headerStyle = {
            textAlign: 'center',
        };
        const setTitleStyle = {
            margin: '20px',
        };
        const songStyle = {
            marginLeft: '45px',
            fontSize: '20px',
            cursor: 'pointer',
        };

        const infoStyle = {
            marginLeft: '75px',
            fontSize: '15px',
        };


        const songText = (setlist, index) => {
            let style = {};
            const artistStyle = {
                color: 'gray',
            };
            if (this.songName === setlist.song_name) {
                style.backgroundColor = 'gold';
                style.paddingLeft = '5px';
                style.paddingTop = '5px';
                style.paddingBottom = '5px';
                artistStyle.backgroundColor = 'gold';
                artistStyle.color = '#484848';
                artistStyle.paddingRight = '5px';
                artistStyle.paddingTop = '5px';
                artistStyle.paddingBottom = '5px';
            }
            let text = <span style={style}
                             key={setlist.song_name + index + "span"}>{index + 1 + ". " + setlist.song_name}</span>;

            if (setlist.song_artist_name !== this.state.artistName) {
                return [text, <em style={artistStyle}
                                  key={setlist.song_name + index + "em"}>{": " + setlist.song_artist_name}</em>];
            } else {
                return text;
            }
        };

        const breadCrumbStyle = {
            position: 'sticky',
            top: '55px',
            display: 'block',
            zIndex: 100,
        };

        const footerStyle = {
            textAlign: 'center',
            padding: '15px',
            width: '100%',
        };

        const goToSong = (songId) => {
            this.state.history.push('/artists/' + this.artistId + "/songs/" + songId);
        };

        const sets = this.state.setlists && Array(...new Set(this.state.setlists.map(setlist => setlist.set_name)));
        return (
            <div>
                <Breadcrumb style={breadCrumbStyle}>
                    <BreadcrumbItem
                        href={"/artists/" + this.artistId}>{this.state.artistName || "Artist Home"}</BreadcrumbItem>
                    <BreadcrumbItem href={"/artists/" + this.artistId + "/songs"}>Songs</BreadcrumbItem>
                    <BreadcrumbItem
                        href={"/artists/" + this.artistId + "/songs/" + this.songId}>{this.songName || "Back"}</BreadcrumbItem>
                </Breadcrumb>
                {this.state.setlists &&
                    <div>
                        <h1 style={headerStyle}>{this.state.artistName + " - " + this.state.eventDate.toLocaleDateString()}</h1>
                        <h2 style={headerStyle}>{this.state.venueName + ", " + this.countryState()}</h2>
                        <h2 style={headerStyle}>{this.state.tourName}</h2>

                        {this.state.info &&
                        <p style={{margin: '25px 350px', textAlign: 'center'}}>{"Note: " + this.state.info}</p>
                        }

                        <div style={{display: 'table', width: '100%'}}>
                            <div style={{float: 'left', width: '50%'}}>
                                {sets.map((setName) => {
                                    return (
                                        <div key={"div" + setName}>
                                            <h3 key={"h3" + setName} style={setTitleStyle}>{setName}</h3>
                                            {this.state.setlists.filter(setlist => setlist.set_name === setName).map((setlist, index) => {
                                                return (
                                                    <div key={index + "outer" + setlist.song_name}>
                                                        <p key={"song" + setlist.song_name + index}
                                                           onClick={() => goToSong(setlist.song_id)}
                                                           style={songStyle}>{songText(setlist, index)}</p>
                                                        {setlist.infos[index] &&
                                                        <p key={"info" + setlist.song_name + index}
                                                           style={infoStyle}>{"Info: " + setlist.infos[index]}</p>
                                                        }
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{float: 'left', width: '50%'}}>
                                <div id="mapContainer" style={{height: '500px', width: '500px', margin: '75px', align: 'center'}}/>
                            </div>
                        </div>
                        <footer style={footerStyle}>{
                            ["Setlist from: ",
                                <a key={this.state.url || "foot"} href={this.state.url} target="_blank" rel="noopener noreferrer">Setlist.fm</a>]
                        }</footer>
                    </div>
                }
            </div>
        );
    }
}


export default Setlist;
