import {React, useState} from 'react';
import { BrowserRouter as Router,Routes, Route, Link } from 'react-router-dom';

import OpenDoc from "./OpenDoc.js";
import Editor from "./Editor.js";
import Register from "./Register.js";
import LogIn from "./LogIn.js"
import Editing from "./Editing.js"
import HomeScreen from "./HomeScreen.js"

function App()  {
    const [docID, setDocID] = useState("");
    function handleLogout(event) {
        fetch("http://194.113.73.46/users/logout", {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'}
        }).then(
            response => {
                console.log(response);
            }
        );
    }
    return (
        <Router>
            <div className = "App">
                <ul>
                    <li><Link to = "/register">Sign Up</Link></li>
                    <li><Link to = "/login">Log In</Link></li>
                    <li><Link to = "/editstuff">Go Edit Bro</Link></li>
                    <li><Link to = "/home">Lemme see dat home</Link></li>
                </ul>
                <button onClick={handleLogout}>Logout</button>
                <Routes>
                    <Route path = "/register" exact element = {<Register/>}></Route>
                    <Route path = "/login" exact element = {<LogIn/>}></Route>
                    <Route path = "/editstuff" exact element = {<Editing/>}></Route>
                    <Route path = "/home" exact element = {<HomeScreen/>}></Route>
                    <Route path = "/edit/:id" exact element = {<Editor/>}></Route>
                </Routes>
            </div>
        </Router>
    )
    // if (docID == "") {
    //     return (
    //         <OpenDoc
    //         docID={docID}
    //         setDocID={setDocID} />
    //     )
    // }
    // else {
    //     return (
    //         <Editor
    //         docID={docID}
    //         />
    //     )
    // }
}

export default App