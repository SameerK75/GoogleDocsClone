import {React, useState} from 'react';

function DocCard(props) {
    const {name, docID} = props;

    function handleEdit() {
        fetch("http://194.113.73.46/edit/" + docID, {
            method: 'GET',
            credentials: 'include',
        }).then(
            response => {
                console.log(response);
            }
        );
    }

    function handleDelete() {
        let payload = {id: docID};
        fetch("http://194.113.73.46/collection/delete", {
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
    return (
        <div>
            <p>{name}</p>
            <p>
                <button onClick = {handleEdit}>Edit</button>
                <button onClick = {handleDelete}>Delete</button>
            </p>
        </div>
    )
}

export default DocCard