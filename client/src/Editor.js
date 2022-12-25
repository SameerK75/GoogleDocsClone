import {React, useState, useEffect, useCallback, useRef} from 'react';
import ReactDOM from 'react-dom/client';
import Quill from "quill";
import "quill/dist/quill.snow.css";
import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import * as base64 from 'js-base64'


function Editor(props) {
    //const docEditor = useRef();
    const {docID} = props;
    const docWrapper = useCallback(wrapper => {
        if (wrapper == null) return;
        wrapper.innerHTML = "";
        const editor = document.createElement("div");
        wrapper.append(editor);
        const docEditor = new Quill(editor, {theme: "snow"});
        //get document ID
        // let URLstring = window.location.href;
        // let docID = URLstring.slice(URLstring.lastIndexOf("edit/") + 5);
        //watch for cursor changes
        docEditor.on('selection-change', function(range, oldRange, source) {
            console.log(range);
            if (range) {
                let payload = {
                    index: range.index,
                    length: range.length
                }
                fetch("http://194.113.73.46/api/presence/" + docID, {
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
        });

        //establish connection
        const evtSource = new EventSource("http://194.113.73.46/api/connect/" + docID, {withCredentials:true});
        console.log(evtSource.withCredentials);

        //create and bind Y.text and quill
        const ydoc = new Y.Doc();
        const ytext = ydoc.getText('text');
        const binding = new QuillBinding(ytext, docEditor);

       

        //event handlers
        evtSource.addEventListener("sync", (event) => {
            console.log("received");
            let docSync = base64.toUint8Array(event.data);
            Y.applyUpdate(ydoc, docSync);
        });

        evtSource.addEventListener("update", (event) => {
            console.log("update received\n");
            let update = base64.toUint8Array(event.data);
            Y.applyUpdate(ydoc,update);
            let ytext = ydoc.getText("text");
            console.log(ytext.toString());
        });

        evtSource.addEventListener("presence", (event) => {
            console.log("recieved presence");
            console.log(event.data);
        })

        ydoc.on("update",update => {
            let ytext = ydoc.getText("text");
            console.log("local update");
            console.log(ytext.toString());
            let updateb64 = base64.fromUint8Array(update);

            let payload = {
                update: updateb64
            }
            fetch("http://194.113.73.46/api/op/" + docID, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            }).then(
                response => {
                    console.log(response);
                }
            );
        });
        
        //
    }, [])
    // const [text, setText] = useState("");
    // //const docWrapper = useRef();
    // useEffect(() => {
    //    const editor = new Quill("#document", {theme: "snow"});
    // }, [])
    // const {docID} = props;
    // const evtSource = new EventSource("http://194.113.73.169/api/connect/" + docID);
    // //console.log(docID);
    // //yuh
    // const ydoc = new Y.Doc();
    // const ytext = ydoc.getText('quill');
    // //console.log(docEditor.current)
    // //const binding = new QuillBinding(ytext, docEditor.current);

    // //event handlers
    // evtSource.addEventListener("sync", (event) => {
    //     console.log("received");
    //     let docSync = base64.toUint8Array(event.data);
    //     Y.applyUpdate(ydoc, docSync);
    //   });

    // evtSource.addEventListener("update", (event) => {
    //     console.log("update received\n");
    //     console.log(event.data);
    //     let update = base64.toUint8Array(event.data);
    //     Y.applyUpdate(ydoc,update);
    //   });
    
    return (
        <div>
            <div id = "document" ref = {docWrapper}></div>
        </div>
    )
}

export default Editor