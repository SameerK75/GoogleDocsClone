import {React, useState} from 'react';
import OpenDoc from "./OpenDoc.js";
import Editor from "./Editor.js";

function Editing() {
    const [docID, setDocID] = useState("");
    if (docID == "") {
        return (
            <OpenDoc
            docID={docID}
            setDocID={setDocID} />
        )
    }
    else {
        return (
            <Editor
            docID={docID}
            />
        )
    }
}

export default Editing