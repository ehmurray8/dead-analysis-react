import React, { Component } from 'react';
import Header from "./components/Header";
import Main from "./components/Main";
import {withRouter} from "react-router-dom";


class App extends Component {
    render() {
        return (
            <div className="App">
                <Header />
                <Main />
            </div>
        );
    }
}


export default withRouter(App);
