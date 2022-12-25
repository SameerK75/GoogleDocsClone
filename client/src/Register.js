import {React, useState} from 'react';
import ReactDOM from 'react-dom/client';
//import Login from "./Login";

function Register() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    function handleEmail(event) {
        setEmail(event.target.value);
    }

    function handlePassword(event) {
        setPassword(event.target.value);
    }

    function handleName(event) {
        setName(event.target.value);
    }

    function handleSubmit() {
        let payload = {
            name: name,
            email: email,
            password: password
        }
        fetch("http://194.113.73.46/users/signup", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        }).then(
            response => {
                console.log(response);
            }
        );
    }

    // function gotoRegister() {
    //     fetch("http://194.113.73.46/login");
        
    // }

    return (
        <div>
            <h1>Sign Up:</h1>
            <span>
                <h2>Full Name: </h2>
                <input type="text" onChange={handleName}/>
            </span>
            <span>
                <h2>Email: </h2>
                <input type="text" onChange={handleEmail}/>
            </span>
            <span>
                <h2>Password: </h2>
                <input type="text" onChange={handlePassword}/>
            </span>
            <button onClick={handleSubmit}>Submit</button>

        </div>
    );
}

export default Register