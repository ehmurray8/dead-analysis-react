import React, {Component} from 'react';
import axios from "axios";
import * as stateGeo from '../data/states.json';
import * as mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'
import {mapBoxGLKey} from "../keys";
import {calculateQuartiles} from "../stats";


export const backendQuery = axios.create({
    baseURL: 'http://localhost:3001/artist/',
    headers: {
        "Access-Control-Allow-Origin": "*",
    },
});


mapboxgl.accessToken = mapBoxGLKey;


const chloroplethColors = ["#ffffcc", "#c7e9b4", "#7fcdbb", "#41b6c4", "#2c7fb8", "#253494"];


class Location extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            ...props,
        };
        this.artistId = this.state.match.params.artistId;
    }

    componentDidMount() {
        this._isMounted = true;
        const stateGeoJson = stateGeo.default;
        const features = stateGeoJson.features;
        backendQuery.get(`${this.artistId}/locations`).then((data) => {
            if (this._isMounted) {
                const venueInfo = data.data[0];
                const stateInfo = data.data[1].filter(x => x != null);
                features.forEach((feature, index) => {
                    feature.properties.shows = stateInfo[index];
                });

                const map = new mapboxgl.Map({
                    container: 'stateLocationsMap',
                    style: 'mapbox://styles/mapbox/light-v9',
                    center: [-98, 38.88],
                    zoom: 3,
                });

                const zoomThreshold = 5;

                console.log(venueInfo);

                map.on('load', () => {
                    map.addSource('venues', {
                        type: 'geojson',
                        data: venueInfo,
                    });

                    map.addSource('states', {
                        type: 'geojson',
                        data: stateGeoJson,
                    });

                    const stateFillColor = ['interpolate', ['linear'], ['get', 'shows']];
                    const stateNumberOfShowsCutOffs = calculateQuartiles(stateInfo);
                    stateNumberOfShowsCutOffs.forEach((value, index) => {
                        stateFillColor.push(value);
                        stateFillColor.push(chloroplethColors[index]);
                    });

                    this.setState({
                        ...this.state,
                        cutOffs: stateNumberOfShowsCutOffs,
                    });

                    map.addLayer({
                        id: 'statesLayer',
                        source: 'states',
                        maxZoom: zoomThreshold,
                        type: 'fill',
                        paint: {
                            'fill-color': stateFillColor,
                            'fill-opacity': 0.75,
                        }
                    }, 'waterway-label');
                });

                this.setState({
                    venueInfo: venueInfo,
                    stateInfo: stateInfo,
                });
            }
        }).catch((err) => console.log(err));
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        const mapStyle = {
            height: '750px',
            width: '1000px',
            'justifyContent': 'center',
        };

        const legendStyle = {
            backgroundColor: '#fff',
            borderRadius: '3px',
            bottom: '30px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0, .10)',
            font: "12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif",
            padding: '10px',
            position: 'absolute',
            left: '910px',
            top: '600px',
            zIndex: '1',
        };

        const legendHeaderStyle = {
            margin: '0 0 10px',
        };

        const colorStyle = {
            borderRadius: '50%',
            display: 'inline-block',
            height: '20px',
            marginRight: '5px',
            width: '20px',
        };

        return (
            <div>
                <div style={mapStyle} id="stateLocationsMap"/>
                { this.state.cutOffs &&
                    <div id='state-legend' style={legendStyle}>
                        <h4 style={legendHeaderStyle}>Shows</h4>
                        { this.state.cutOffs.map((cutOff, index) => {
                            colorStyle.backgroundColor = chloroplethColors[index];
                            return <div key={`div-${cutOff}`}><span key={`span-${cutOff}`} style={{...colorStyle}}/>{cutOff}</div>;
                        })}
                    </div>

                }
            </div>
        );
    }
}


export default Location;