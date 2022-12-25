
const express = require('express')
const router = express.Router()
const User = require('../models/user-model')
const sessions = require('express-session');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

router.post('/signup', async (req,res) => {
  res.header("X-CSE356", "6320e904047a1139b67025a6");

  await User.findOne({
    name: req.body.name
  })
  .then((user) => {
    if (user) {
      res.json({"status":"ERROR"});
      return;
    }

    User.findOne({
      email: req.body.email
    })
    .then((user) => {
      if (user) {
        res.json({error: true, message: "Email exists"});
        return;
      }
      const curUser = new User(req.body);
      curUser.status = "Pending";
      const genKey = crypto.generateKeySync('hmac', { length: 128 });
      const key = genKey.export().toString('hex');
      curUser.verificationKey = key;
      
      curUser.save();
      res.json({"status":"OK"});
      
      sendMail(curUser.email,curUser.verificationKey);
  }).catch((e) => console.log("error", e));
}).catch((e) => console.log("error",e));
});


router.post('/login', async (req,res) => {
  res.header("X-CSE356", "6320e904047a1139b67025a6");
  console.log("origin" + req.headers.origin);
  //res.header('Access-Control-Allow-Origin', req.headers.origin);
  User.findOne({
    email: req.body.email,
    password: req.body.password
  })
    .then((user)  => {
      if (!user) {
        return res.json({error: true, message: "Not found"});
      }
      if (user.status != "Active") {
        return res.json({error: true, message: "Not active"});
      }
      session=req.session;
      session.name=user.name;
      // console.log(req.session);
      // console.log(req.session.id);

      res.json({name:user.name});
    })
    .catch((e) => console.log("error",e));
});

// router.post('/logout', async (req,res) => {
//   res.header("X-CSE356", "6320e904047a1139b67025a6");
//   req.session.destroy();
//   res.json({});
// });

router.get('/verify', async (req,res) => {
  res.header("X-CSE356", "6320e904047a1139b67025a6");
  console.log(req.query.email);
  console.log(req.query.key);
  User.findOne({
    email: req.query.email,
    verificationKey: req.query.key
  })
    .then((user) => {
      console.log(user);
      if (!user) {
        res.json({error: true, message: "user not found"});
        return;
      }

      user.status = "Active";
      user.save((err) => {
        if (err) {
          res.json({"status":"ERROR"});
          return;
        }
        else {
          res.json({"status":"OK"});
        }
      });
    })
    .catch((e) => console.log("error", e));
});

function sendMail(userEmail, userKey) {
  // send mail
  let testAccount = nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    sendmail: true
  });
  
  let encodedEmail = encodeURIComponent(userEmail);

  transporter.sendMail({
    from: "sender@example.com",
    to: userEmail,
    subject: "Verification Email",
    html: "http://194.113.73.46/users/verify?" + "email=" + encodedEmail + "&key=" + userKey
  
  }, (err) => {
    console.log(err);
  });
};


module.exports = router