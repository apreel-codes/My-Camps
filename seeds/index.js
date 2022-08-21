const mongoose = require('mongoose');
const cities = require('./cities');
//because we need to pick one place and one descriptor to create a campground name
const{places, description, descriptors} = require('./seedHelpers');


//this brings in the model created
const Campground = require('../models/campground'); //double .. because I'm in a different directory

mongoose.connect('mongodb://localhost:27017/yelp-camp', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

//this logic checks if there's an error
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
//if there isn,t, this gets printed out
db.once("open", () => {
    console.log("Database connected")
});


const sample = array => 
   //to pick a random element from an array
   array[Math.floor(Math.random() * array.length)];

//to remove what we currently have in our database beacause I was working with some other sets of data
const seedDB = async () => {
    await Campground.deleteMany({});
    //then make new campgrounds based on cities.js and seedHelper.js
    //we loop over them
    for(let i = 0; i < 200; i++){
        //random number to generate the cities randomly, the cities are over 1000
        const random1000 = Math.floor(Math.random() * 1000);
        //to generate random price
        const price= Math.floor(Math.random() * 20) + 10;
        //to make a new campground
        const camp = new Campground({
            author: '62f8f55813a542ff69e34cb3',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta assumenda ex nulla non repellat accusamus perspiciatis, deserunt ea ullam! Quis, cupiditate! Commodi minus totam ipsa excepturi nobis esse voluptate obcaecati.',
            price,
            geometry: { type: 'Point', coordinates: [cities[random1000].longitude, cities[random1000].latitude] },
            images: [
                {
                  url: 'https://res.cloudinary.com/davlauj34/image/upload/v1660684852/YelpCamp/g7qqzgu4gslzesrw4bvo.webp',
                  filename: 'YelpCamp/g7qqzgu4gslzesrw4bvo'
                },
                {
                  url: 'https://res.cloudinary.com/davlauj34/image/upload/v1660684852/YelpCamp/h3qtvmj3gzxkijbueamn.jpg',
                  filename: 'YelpCamp/h3qtvmj3gzxkijbueamn'
                }
              ]
        })
        await camp.save();
    }
}

//this closes the database
seedDB().then(() => {
    mongoose.connection.close();
})