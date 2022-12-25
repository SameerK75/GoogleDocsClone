import {React, useState, useEffect} from 'react';
import DocCard from "./DocCard"

function HomeScreen() {
    const [docList, setDocList] = useState([]);
    const [docName, setDocName] = useState("");
    useEffect(() => {
        fetch("http://194.113.73.46/collection/list", {
        method: 'GET',
        credentials: 'include',
    }).then(
        response => {
            console.log(response);
            return response.json()
        }
    ).then(
        results => {
            console.log(results);
            setDocList(results);
        }
    )

    console.log(docList);
    },[])

    function handleName(event) {
        setDocName(event.target.value);
    }

    function handleCreateDoc() {
        let payload = {name: docName};
        fetch("http://194.113.73.46/collection/create", {
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

    return(
        <div>
            <form id = "create document form">
                <label for="name">Document Name:</label>
                <input type = 'text' id = 'name' name = 'name' onChange = {handleName}/>
                <button onClick = {handleCreateDoc}>Submit</button>
            </form>
            {
                docList.map(list => (
                    <DocCard
                    key = {list.id}
                    docID = {list.id}
                    name = {list.name}/>
                ))
            }
        </div>
    )
}

export default HomeScreen