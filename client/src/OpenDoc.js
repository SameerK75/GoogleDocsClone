import {React, useState} from 'react';

function OpenDoc(props)  
{
    const [text, setText] = useState("");
    const {docID, setDocID} = props;

    function handleChange(event) {
        setText(event.target.value);
    }

    function handleSubmit() {
        //open up the doc with the typed ID
        setDocID(text);
    }

    return (
        <div>
            <h1>Document ID:</h1>
            <input type="text" onChange={handleChange}/>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default OpenDoc