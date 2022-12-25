
let base64 = require('js-base64');
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const sessions = require('express-session');
const yleveldb =  require('y-leveldb');
const { Level } = require('level');
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const path = require('path')

const { Client } = require('@elastic/elasticsearch')
const eClient = new Client({ node: 'http://localhost:9200'});

let Y = require("yjs");
const express = require('express');
const cors = require('cors');
const persistence = new yleveldb.LeveldbPersistence('./storage-location')

const app = express();

app.use(express.json());
app.use(cors({
    origin: ["http://194.113.73.46:3000","http://130.245.171.150"],
    credentials: true
}));

const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
  }));


let clients = [];

let docs = [];

mongoose.connect('mongodb://localhost:27017/ms2',
  {
    useNewUrlParser: true
  }
);

let clientNum = 0;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

// sets up the elastic search index
async function ingest(doc) {
    await eClient.index({
        index: 'ms2',
        id: doc.docId,
        document: {
            name: doc.name,
            text: doc.ydoc.getText("text").toString()
        }
    })

    await eClient.indices.refresh({index: 'ms2'});
}


const userRouter = require('./routes/user-routes');
app.use('/users', userRouter);

// const collectionRouter = require('./routes/collection-routes');
// app.use('/collection',collectionRouter);

const mediaRouter = require('./routes/media-routes');
app.use('/media',mediaRouter);

app.post('/collection/create', async (req,res) => {
    res.header("X-CSE356", "6320e904047a1139b67025a6");
    if (!req.session.name) {
        return res.json({error: true, message: "Not signed in"})
    }
    let name = req.body.name;
    //console.log(name);
   
    let id = crypto.randomBytes(20).toString('hex');

    let newYdoc = new Y.Doc();
    let curDoc = {
        name: name,
        docId: id,
        ydoc: newYdoc,
        clients: []
    }
    
    await ingest(curDoc);

    docs.unshift(curDoc);
    res.json({
        id:id
    })
        //persistence.storeUpdate(id, Y.encodeStateAsUpdate(newYdoc));
    newYdoc.on("update", update => {
            //console.log("update");
        let converted = base64.fromUint8Array(update);

            //the current id
            //console.log(this);
            //let curId = docs.find(doc=> doc.ydoc===newYdoc).docId;

            //for every client with a matching docId i write the new update to the event stream
            //console.log(id);
            curDoc.clients.forEach(client => {
                client.res.write("event: update\n");
                client.res.write(`data: ${converted}\n`);
                client.res.write("\n\n");
            })
            // clients.filter(client => client.docId === id).forEach(client => {
            //     //console.log("yuH");
            //     client.res.write("event: update\n");
            //     client.res.write(`data: ${converted}\n`);
            //     client.res.write("\n\n");
            // });
            //console.log(newYdoc.getText("text").toString());
        })
    
})

app.post('/collection/delete',(req,res) => {
    res.header("X-CSE356", "6320e904047a1139b67025a6");
    if (!req.session.name) {
        return res.json({error: true, message: "Not signed in"})
    }

    let id = req.body.id;
    docs = docs.filter(doc=> doc.docId!=id);
    res.json({});
})

app.get('/collection/list',(req,res) => {
    res.header("X-CSE356", "6320e904047a1139b67025a6");
    if (!req.session.name) {
        return res.json({error: true, message: "Not signed in"})
    }
    //top 10 array

    //console.log(docs);
    let retList = [];
    docs.slice(0,10).forEach(doc=> {
        retList.push({
            id: doc.docId,
            name: doc.name
        });
    });
    

    res.json(retList);
});

app.get('/api/connect/:id', async (req,res) => {
    const headers = {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'X-CSE356': "6320e904047a1139b67025a6"
      };

    if (!req.session.name) {
        return res.json({error: true, message: "Not signed in"})
    }

    
    // /res.header("");
    let id = req.params.id;

    //console.log(id);
    req.session.docId = id;

    let curDoc = docs.find(doc => doc.docId === id);
    //doc should have arleady been created
    if (curDoc === undefined) {
        res.json({error: true, message: "Doc Not Created"});
        return;
    }

    res.writeHead(200, headers);

    //get the current ydoc
    let curYDoc = curDoc.ydoc;
    //sync the ydoc
    res.write("event: sync\n");
    //console.log("sync: " + req.session.name);
    //console.log("ytext " + ytext);

    let curState = Y.encodeStateAsUpdate(curYDoc);
    let stateb64 = base64.fromUint8Array(curState);
    
    res.write(`data: ${stateb64}\n`);
    
    res.write("\n\n");

    let newClient = {
        name: req.session.name,
        session_id: req.session.id,
        cursor: {
            index: 0,
            length: 0,
        },
        res
    }
    curDoc.clients.push(newClient);

    req.on('close', () => {  
        res.write("event: presence\n");
        res.write(`data: {}\n`);
        res.write("\n");
        curDoc.clients = curDoc.clients.filter(client => client.session_id !== req.session.id);
        req.session.docId = null;
      }); 

});

app.post('/users/logout', async (req,res) => {
    res.header("X-CSE356", "6320e904047a1139b67025a6");
    if (req.session.docId) {
        let curDoc = docs.find(doc => doc.docId = req.session.docId);
        curDoc.clients = curDoc.clients.filter(client => client.session_id !== req.session.id);
    }
    req.session.destroy();
    res.json({});
  });

app.post('/api/op/:id', (req,res) => {
    res.header("X-CSE356", "6320e904047a1139b67025a6");
    if (!req.session.name) {
        return res.json({error: true, message: "Not signed in"})
    }

    let id = req.params.id;

    let newUpdatebase64 = req.body.update; //base64 string

    let newUpdate = base64.toUint8Array(newUpdatebase64);


    let curDoc = docs.find(doc => doc.docId === id);
    let curYdoc = curDoc.ydoc;
    Y.applyUpdate(curYdoc,newUpdate); //all updates will propogate to the other docs

    docs = docs.filter(doc=> doc.docId != id);
    docs.unshift(curDoc);

    res.sendStatus(200);
});

app.post('/api/presence/:id', (req,res) => {
    res.header("X-CSE356", "6320e904047a1139b67025a6");
    if (!req.session.name) {
        return res.json({error: true, message: "Not signed in"})
    }
    //res.header('Access-Control-Allow-Origin', req.headers.origin);
    let id = req.params.id;

    let index = req.body.index;
    let length = req.body.length;

    let curDoc = docs.find(doc => doc.docId === id);

    let curClient = curDoc.clients.find(client=>client.session_id === req.session.id);
    if (curClient) {
        curClient.cursor.index = parseInt(index);
        curClient.cursor.length = parseInt(length);
        
        let newCursor = {
            session_id: curClient.session_id,
            name: curClient.name,
            cursor: curClient.cursor
        }

        curDoc.clients.forEach(client=> {
            client.res.write("event: presence\n");
            client.res.write(`data: ${JSON.stringify(newCursor)}\n`);
            client.res.write("\n");
        });
    }

    res.sendStatus(200);

});



function auth(req,res,next) {
    res.header("X-CSE356", "6320e904047a1139b67025a6");
    if (!req.session.name) {
        return res.json({error: true, message: "Not signed in"})
    }
    else {
        next();
    }
}
app.use('/home', auth, express.static('client/home/build', {
    setHeaders: function (res,path,stat) {
        res.header("X-CSE356", "6320e904047a1139b67025a6");
    }
}));
// app.use()
app.use('/login', express.static('client/login/build', {
    setHeaders: function (res,path,stat) {
        res.header("X-CSE356", "6320e904047a1139b67025a6");
    }
}));

app.use('/edit/:id',auth, express.static('client/edit/build', {
    setHeaders: function (res,path,stat) {
        res.header("X-CSE356", "6320e904047a1139b67025a6");
    }
}));

app.use('/edit/static', express.static('client/edit/build/static', {
    setHeaders: function (res,path,stat) {
        res.header("X-CSE356", "6320e904047a1139b67025a6");
    }
}));

app.post('/index/search', async (req,res) => {
    res.header("X-CSE356", "6320e904047a1139b67025a6");
    if (!req.session.name) {
        return res.json({error: true, message: "Not signed in"})
    }
    let phrase = req.query.q;
    const body = {
        query: {
            match_phrase_prefix: {
                "text" : phrase
            }
        }
    }
    for (let doc of docs) {
        await eClient.index({
            index: "ms2",
            id: doc.docId,
            document: {
                name: doc.name,
                text: doc.ydoc.getText("text").toString()
            }
        })
    };
    await eClient.indices.refresh({ index: 'ms2' });

    // let searchRes = await eClient.msearch({
    //     searches: [
    //         { index: "ms2" },
    //         { query: {
    //             match_phrase_prefix: {
    //                 "text" : phrase
    //             }  
    //         }},
    //         { index: "ms2" },
    //         { query: {
    //             match_phrase_prefix: {
    //                 "name" : phrase
    //             }  
    //         }}
    // ]
    // });

    // console.log(searchRes.responses[0].hits.hits[0]._source);
    // console.log(searchRes.responses[1].hits.hits[1]._source);
    
    // TODO: have to empty out index after server shuts down
    let searchRes = await eClient.search({
            index: "ms2",
            size: 10,
            query: {
                multi_match: {
                    query: phrase,
                    type: "phrase_prefix",
                    fields: ["text", "name"]
                    //tiebreaker: 0.3
                }  
            },
            highlight: {
                fields: {
                    text : {},
                    name : {}
                }
            }
    });
    
    //console.log(searchRes.hits.hits);
    let finalRes = []
    for(let i = 0; i < searchRes.hits.hits.length; i ++){
        let resHit = searchRes.hits.hits[i];
        //console.log("highlight: \n" + resHit.highlight);
        let docid = resHit._id;
        let name = resHit._source.name;
        let snip = "";
        if (resHit.highlight) {
            if (resHit.highlight.text) {
                snip = resHit.highlight.text;
            }
            else {
                snip = resHit.highlight.name;
            }
        }
        
        finalRes.push({docid: docid, name: name, snippet: snip})
    }

    //console.log(finalRes);

    res.json(finalRes);
});

app.use('/library', express.static('example-crdt/dist', {
    setHeaders: function (res,path,stat) {
        res.header("X-CSE356", "6320e904047a1139b67025a6");
    }
}));

app.listen(80, () => {
    console.log("Server is running at port 80");
});

