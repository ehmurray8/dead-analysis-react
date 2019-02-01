import Navbar from 'react-bootstrap/Navbar';
import React from "react";
import Nav from "react-bootstrap/Nav";
import FormControl from "react-bootstrap/es/FormControl";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const Header = () => {

    return (
        <Navbar bg="dark" variant="dark">
            <Navbar.Brand href="/" >Music Analysis</Navbar.Brand>
            <Nav className='mr-auto'>
                <Nav.Link href="/">Home</Nav.Link>
                <Nav.Link href="/artists">Artists</Nav.Link>
            </Nav>
            <Form inline>
                <FormControl type="text" placeholder="search" className="mr-sm-2"/>
                <Button variant="outline-info">Search</Button>
            </Form>
        </Navbar>
    );
};


export default Header;