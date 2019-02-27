import React from "react";
import {Switch, Route} from 'react-router-dom';
import Home from "./Home";
import Artists from "./Artists";
import Artist from "./Artist";
import ArtistSearch from "./ArtistSearch";
import Songs from "./Songs";
import SongDetails from "./SongDetails";
import Setlist from "./Setlist";


const Main = () => {
    return (
        <Switch>
            <Route exact path='/' component={Home}/>
            <Route exact path='/artists' component={Artists}/>


            <Route exact path='/artists/:artistId' component={Artist}/>
            <Route exact path='/artists/:artistId/songs' component={Songs}/>
            <Route exact path='/artists/:artistId/songs/:songId' component={SongDetails}/>
            <Route exact path='/artists/:artistId/songs/:songId/setlists/:setlistId' component={Setlist}/>


            <Route exact path='/search/artists/:artistName' component={ArtistSearch}/>
        </Switch>
    );
};


export default Main;