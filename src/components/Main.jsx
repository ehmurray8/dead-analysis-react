import React from "react";
import {Switch, Route} from 'react-router-dom';
import Home from "./Home";
import Artists from "./Artists";
import Artist from "./Artist";

const Main = () => {
    return (
        <Switch>
            <Route exact path='/' component={Home}/>
            <Route exact path='/artists' component={Artists}/>
            <Route path='/artists/:artistId' component={Artist}/>
        </Switch>
    );
};

export default Main;