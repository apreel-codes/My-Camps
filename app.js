if(process.env.NODE_ENV === "production"){ //process.env.NODE_ENV is an environment variable that is either development or production
    require('dotenv').config();
}



const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

const MongoDBStore = require("connect-mongo")(session); //for storing session info in mongo

const helmet = require('helmet');

// process.env.DB_URL; //our database url from env file
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'; //either of the two databases

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const mongoSanitize = require('express-mongo-sanitize');

const Joi = require('joi');   
const { join } = require('path');  


mongoose.connect(dbUrl, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
});

//this logic checks if there's an error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
//if there isn,t, this gets printed out
db.once("open", () => {
    console.log("Database connected")
});
 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))); //this is referencing the public folder we created


app.use(mongoSanitize({  //using the mongo sanitize package 
    replaceWith: '_'
})); 

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

//using MongoStore
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //the store should save just once in 24hours, and not all the time
});

//check for error from the store
store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
});

//using the session package
const sessionConfig = {
    store, //then pass in store variable
    name: 'session', //this is a random name so we don't want attackers to extract user's info from the default sessionid
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //this prevent the cookie from being accessed on the client-side
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expirarydate set to 1 week from the present day
        maxAge: 1000 * 60 * 60 * 24 * 7, //the maximum age of the cookie is a week
    }
}
app.use(session(sessionConfig));
app.use(flash()); //using the flash package


// app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/davlauj34/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//using the passport package
app.use(passport.initialize()); //required to initialize passport
app.use(passport.session()); //used if we want persistent login session
passport.use(new localStrategy(User.authenticate())); //the user model should be passed in here

passport.serializeUser(User.serializeUser()); //this tells passport how to serialize a user(keeping a user in session)
passport.deserializeUser(User.deserializeUser()); //getting a user out of session

app.use((req, res, next) => {
    res.locals.currentUser = req.user; //checks who is currently logged in
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', userRoutes);
app.use('/campgrounds',   campgroundRoutes); //(from line 12) //the campgrounds routes are in the campgrounds.js file and this is the connection, the first argument is the path which has now been removed from the main paths in the other file
app.use('/campgrounds/:id/reviews', reviewRoutes); //(from line 13) //the reviews routes are in the reviews.js file and this is the connection, the first argument is the path which has now been removed from the main paths in the other file

app.get('/', (req, res) => {
    res.render('campgrounds/home')
})

// 'all' means for every any kind of path other than the specific ones above
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found!', 404));
})

//generic error handler
app.use((err, req, res, next) => {
    const { statusCode = 500} = err; //'err' in this case is the ExpressError above
    if(!err.message) err.message = 'Something went wrong!'; //since this defined err message doesn't naturally occur inside 'err' itself, we use if so it can be used in the error template
    res.status(statusCode).render('error', { err }) //passing the 'err' through into the template
})

const port = process.env.PORT || 3000; //heroku has its own specified port number so we don't need to specify however, our default is 3000
app.listen(port, () => {
    console.log(`LISTENING ON PORT ${port}!`);
})