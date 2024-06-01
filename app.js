const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require('./model/user');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
let app = express();
const crypto = require('crypto');
app.use(express.static(__dirname + '/public'));
const { createProxyMiddleware } = require('http-proxy-middleware');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://TKT314:leicester300@cluster0.g8psy4r.mongodb.net/TKT314');

var db=mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function(callback){
	console.log("connection succeeded");
})

const axios = require('axios');
const qs = require('qs');
const clientId = 'c97357a5eaff4fb984809b2c766159b1';
const clientSecret = '859efe96b2834a77b759d3a755d7347d';
const auth = 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64');
let token = '';
const getToken = async () => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: qs.stringify({grant_type: 'client_credentials'}),
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    token = response.data.access_token;
    console.log('Token:', token); // Log để kiểm tra token
  } catch (error) {
    console.error('Error in getToken:', error.response ? error.response.data : error.message);}
};

app.set("view engine", "ejs");
app.use(require("express-session")({
    secret: "meow meoww",
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));


app.use(passport.initialize());
app.use(passport.session());
 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//=====================
// ROUTES
//=====================

// Showing home page
app.get("/", function (req, res) {
    res.render("home");
});

// Showing payment page
app.get("/forum", function (req, res) {
  res.render("forum");
});
app.get("/chatgpt", function (req, res) {
  res.render("chatgpt");
});
app.get("/Exercises", function (req, res) {
  res.render("Exercises");
});
// Showing signup form
app.get("/register", function (req, res) {
  res.render("register");
});

//Showing login form
app.get("/login", function (req, res) {
  res.render("login");
});

//showing shazam
app.get("/Modules", function (req, res) {
  res.render("Modules");
});

app.get("/Our-team", function (req, res) {
  res.render("Our-team");
});
app.get("/TTK", function (req, res) {
  res.render("TTK");
});
app.get("/TTK2", function (req, res) {
  res.render("TTK2");
});
app.get("/TTK3", function (req, res) {
  res.render("TTK3");
});
app.get("/TTK4", function (req, res) {
  res.render("TTK4");
});
app.get("/TTK5", function (req, res) {
  res.render("TTK5");
});
app.get("/TTK6", function (req, res) {
  res.render("TTK6");
});
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.render("search");
  }
  await getToken();
  const data = await search(query);
  // res.render("search", { data });
  res.json(data); // Trả về dữ liệu dạng JSON
});

//handling user sign up
app.post('/register', function(req,res){
var name = req.body.name;

var pass = req.body.password;
// Tạo salt
const salt = crypto.randomBytes(16).toString('hex');

// Băm mật khẩu với salt
const hashedPassword = crypto.createHmac('sha256', salt).update(pass).digest('hex');
var data = {
  "name": name,
 
  // "password": pass,
  "password": hashedPassword,
  "salt": salt
}
db.collection('doan').insertOne(data,function(err, collection){
  if (err) throw err;
  console.log("Record inserted Successfully");
    
});
return  res.redirect("/login");
})



//Handling user login
app.post("/login", async function(req, res){
  try {
      // check if the user exists
      const detailsCollection = db.collection('doan');
      const user = await detailsCollection.findOne({ name:req.body.name});
     
      if (user) {
     // Lấy salt từ người dùng trong cơ sở dữ liệu
     const salt = user.salt;

     // Băm mật khẩu nhập vào với salt
     const hashedPassword = crypto.createHmac('sha256', salt).update(req.body.password).digest('hex');
      const result = hashedPassword === user.password;
     if (result) {
      req.session.username = user.name;
      return res.render("home");
        } else {
      
          return res.json({ error: "Password doesn't match" });
        }
      } 
      else {
        return res.json({ error: "User doesn't exist" });
      }
    } catch (error) {
      return res.json({ error });
    }
});
app.get("/checkLoginStatus", function(req, res) {
  if (req.session.username) {
    // Người dùng đã đăng nhập
    return res.json({ loggedIn: true, username: req.session.username });
  } else {
    // Người dùng chưa đăng nhập
    return res.json({ loggedIn: false });
  }
});
app.get("/home", function(req, res) {
  // Lấy tên người dùng từ phiên
  const username = req.session.username;

  // Kiểm tra xem người dùng đã đăng nhập hay chưa
  if (username) {
    // Hiển thị trang home với chào mừng tên người dùng
    return res.render("home", { username: username });
  } else {
    // Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
    return res.redirect("/login");
  }
});
app.get('/logout', function(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.json({ error: 'Logout failed' });
    }
    res.redirect('/login');
  });
});

// Hàm gửi yêu cầu AJAX để kiểm tra trạng thái đăng nhập


// Route to handle recording and identifying song



 
let port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server Has Started!");
});