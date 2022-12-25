const express = require('express')
const multer  = require('multer')
const router = express.Router()
const path = require("path")

var dictionary = {};

function fileFilter (req, file, cb) {
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif')
    {
        console.log("Error when uploading");
        cb(null, false);
    } else {
        console.log(file);
        // if (file.mimetype === 'image/png')
        // {
        //     dictionary[file.filename] = 'image/png';
        // }
        // else if(file.mimetype === 'image/jpeg')
        // {
        //     dictionary[file.filename] = 'image/jpeg';
        // }
        cb(null, true);   
    }
    // To accept the file pass `true`, like so:
    // cb(null, true)
    // You can always pass an error if something goes wrong:
    // cb(new Error('I don\'t have a clue!'))
}

const upload = multer({ dest: './uploads', fileFilter: fileFilter });

router.post('/upload', upload.single('file'), (req,res) => {
    res.header("X-CSE356", "6320e904047a1139b67025a6");
    if (!req.session.name) {
        return res.json({error: true, message: "Not signed in"})
    }
    let file = req.file;
    if (!file) {
        res.json({error: true, message: "Not valid file type"});
        return;
    }
    if (file.mimetype === 'image/png') 
    {
        dictionary[file.filename] = 'image/png';
    }
    else if(file.mimetype === 'image/jpeg')
    {
        dictionary[file.filename] = 'image/jpeg';
    }
    else if(file.mimetype == 'image/gif')
    {
        dictionary[file.filename] = 'image/gif';
    }
    res.json({
        mediaid : req.file.filename
    });
})

router.get('/access/:mediaid', (req,res) => {
    const media_id = req.params.mediaid;
    res.header("X-CSE356", "6320e904047a1139b67025a6");
    if (!req.session.name) {
        return res.json({error: true, message: "Not signed in"})
    }
    let options = {
        headers: {
            "Content-Type": dictionary[media_id]
        }
    }
    console.log(dictionary);
    if (dictionary[media_id] === 'image/png')
    {
        res.sendFile("/root/ms2/server/uploads/" + media_id, options);
    }
    else if(dictionary[media_id]  === 'image/jpeg')
    {
        res.sendFile("/root/ms2/server/uploads/" + media_id, options);
    }
    else if(dictionary[media_id]  === 'image/gif')
    {
        res.sendFile("/root/ms2/server/uploads/" + media_id, options);
    }
    else {
        res.json({error: true, message: "media_id not found"})
    }
})


module.exports = router;