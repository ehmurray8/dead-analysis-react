import Navbar from 'react-bootstrap/Navbar';
import React, {Component} from "react";
import Nav from "react-bootstrap/Nav";
import FormControl from "react-bootstrap/es/FormControl";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {withRouter} from "react-router-dom";

class Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
    }

    renderRedirect = () => {
        const searchInput = document.getElementById("search-input").value;
        this.props.history.replace('/search/artists/' + searchInput);
    };

    render() {
        return (
            <div>
               <Navbar bg="dark" variant="dark">
                   <Navbar.Brand href="/" >Music Analysis</Navbar.Brand>
                   <Nav className='mr-auto'>
                       <Nav.Link href="/">Home</Nav.Link>
                       <Nav.Link href="/artists">Artists</Nav.Link>
                   </Nav>
                   <Form inline>
                       <FormControl type="text" placeholder="search" className="mr-sm-2" id="search-input"/>
                       <Button variant="outline-info" onClick={this.renderRedirect}>Search</Button>
                   </Form>
               </Navbar>
            </div>
        );
    }
}


export default withRouter(Header);