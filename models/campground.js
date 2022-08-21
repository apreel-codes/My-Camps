const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
const User = require('./user');

const ImageSchema = new Schema({
      url: String,
      filename: String
});

//let's try to define the dimensions of the images
ImageSchema.virtual('thumbnail').get(function() {
   return this.url.replace('/upload', '/upload/w_200/h_200'); //here we're replacing the /upload part in the url to /upload/w_200
})

const opts = { toJSON: { virtuals: true } }; //so any virtuals made will appear in our model

const CampgroundSchema = new Schema({
   title: String,
   images: [ImageSchema],
   geometry: {
      type: {
         type: String,
         enum: ['Point'],
         required: true
      },
      coordinates: {
         type: [Number],
         required: true
      }
   },
   price: Number,
   description: String,
   location: String,
   author: {  //this associates each campground to a particular owner
      type: Schema.Types.ObjectId,
      ref: 'User' //making reference to the User model
   },
   reviews: [
      {
         type: Schema.Types.ObjectId,   //since we'll be having many reviews to one Campground(one to many relationship)
         ref: 'Review' //making reference to the Review model we made  
      }
   ]
}, opts);

// creating a virtual for campground model so it can be added to the schema virtually, so we can now do campground.properties.popUpMarkUp
CampgroundSchema.virtual('properties.popUpMarkUp').get(function() { //to make the popup text a link that will go to the particular campground it displays
   return `
   <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>  
   <p>${this.description.substring(0, 30)}</p>` //substring defines the amount of characters to be shown, here we want just 0 to 20 characters
})

//to delete a campground and associated reviews all together
CampgroundSchema.post('findOneAndDelete', async function(campground){
   //if campground was found and deleted
   if(campground){
      await Review.deleteMany({   //then remove all the reviews present inside the campground i just deleted
         _id: {
            $in: campground.reviews
         }
      })
   }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
