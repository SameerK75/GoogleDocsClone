import {React, useState, useEffect, useCallback, useRef} from 'react';
import ReactDOM from 'react-dom/client';


function LogIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleEmail(event) {
        setEmail(event.target.value);
    }

    function handlePassword(event) {
        setPassword(event.target.value);
    }

    function handleSubmit() {
        let payload = {
            email: email,
            password: password
        }
        fetch("http://194.113.73.46/users/login", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(payload)
        }).then(
            response => {
                console.log(response);
            }
        );
    }

    // function gotoLogin()
    // {
    //     return(
    //         <
    //     )
    // }

    return (
        <div>
            <h1>Login Info:</h1>
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

export default LogIn