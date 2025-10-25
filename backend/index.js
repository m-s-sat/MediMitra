// backend/index.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');
const authRouter = require('./routes/auth');
const hospitalRouter = require('./routes/hospital');
const User = require('./model/auth');
const HospitalReg = require('./model/hospitalreg');
const http = require('http');
const websocket = require('ws');
const websocketserver = require('ws').WebSocketServer;
const mongoClient = require('mongodb').MongoClient;
const { setupNotification } = require('./control/auth');
const { setupWelcomeNotifications, scheduleWeeklyTrackerReminders } = require('./control/cronjob');
const { MongoClient } = require('mongodb');
const localStrategy = require('passport-local').Strategy;
const googleStrategy = require('passport-google-oauth2').Strategy;
const path = require('path');
const { isAuth } = require('./common/common');

const server = express();
const httpServer = http.createServer(server);

const wss = new websocketserver({ server: httpServer });

wss.on('connection', (ws)=>{
    console.log('User connected to WebSocket');
    ws.on('close',()=>{
        console.log('user disconnected');
    })
})

function broadcast(data) {
    wss.clients.forEach(client=>{
        if(client.readyState === 1){
            client.send(JSON.stringify(data))
        }
    })
}

async function watchSuggestion(){
    const mongo = new MongoClient(process.env.MONGOURI);
    await mongo.connect();
    const db = mongo.db('test');
    const suggestion = db.collection('bookings');
    const changeStream = suggestion.watch();
    changeStream.on('change',(change)=>{
        console.log('Change detected in hospital registrations:', change);
        broadcast({
            type: 'hospital_update',
            payload: change.fullDocument
        })
    })
}
watchSuggestion().then(()=>{
    console.log('Watching for changes in hospital registrations...');
}).catch(err=>{
    console.error('Error setting up change stream:', err);
});

const isProduction = process.env.NODE_ENV === 'production';
server.use(express.static(path.join(__dirname, 'dist')));
server.use(express.json());
server.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
}));
server.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction
    }
}));
server.use(passport.initialize());
server.use(passport.session());

passport.use("local", new localStrategy(async function verify(username, password, done) {
    try {
        const user = await User.findOne({ $or: [{ username: username }, { phone: username }] });

        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) return done(err);
                if (!result) return done(null, false, { message: "Invalid username or password" });
                return done(null, user);
            });
        } else {
            const hospital = await HospitalReg.findOne({ $or: [{ "admin.email": username }, { "admin.phone": username }] });
            if (!hospital) {
                return done(null, false, { message: "Invalid Username or Password" });
            }
            bcrypt.compare(password, hospital.admin.password, (err, result) => {
                if (err) return done(err);
                if (!result) return done(null, false, { message: "Invalid Username or Password" });
                return done(null, hospital);
            });
        }
    } catch (err) {
        return done(err);
    }
}));
server.set('trust proxy', 1);
passport.use("google", new googleStrategy({
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACKURL,
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ username: profile.email });
        if (!user) {
            user = new User({
                username: profile.email,
                password: "google",
                name: profile.displayName,
                avatar: profile.picture,
                preferredLanguage: 'en',
                role: 'patient'
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, cb) => {
    const identifier = {
        id: user._id,
        role: user.role
    };
    cb(null, identifier);
});

passport.deserializeUser(async (identifier, cb) => {
    try {
        if (identifier.role === 'hospital') {
            const hospital = await HospitalReg.findById(identifier.id);
            cb(null, hospital);
        } else {
            const user = await User.findById(identifier.id);
            cb(null, user);
        }
    } catch (err) {
        cb(err, null);
    }
});

async function main() {
    await mongoose.connect(process.env.MONGOURI);
    console.log('MongoDB connected');
    scheduleWeeklyTrackerReminders();
}
main().catch(err => console.log(err));


server.use('/api/auth', authRouter.router);
server.use('/api/hospital', hospitalRouter);
server.get('/api/status', (req,res)=>{
    res.send({status: 'ok'});
})

server.post('/api/chat_message', isAuth, (req, res) => {
  const postData = JSON.stringify(req.body);

  const options = {
    hostname: '127.0.0.1',
    port: 8000,
    path: '/chat_message',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    if (proxyRes.statusCode !== 200) {
      res.status(proxyRes.statusCode).end();
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Error proxying request:', err);
    res.status(500).send('Proxy error');
  });

  proxyReq.write(postData);
  proxyReq.end();
});

server.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

httpServer.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});