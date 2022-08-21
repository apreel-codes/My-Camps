const { campgroundSchema, reviewSchema } = require('./JoiValidator.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){ //if user isnt authenticated i.e not logged in
        req.session.returnTo = req.originalUrl; //saves the url a user is trying to access before encountering isLoggedIn
        req.flash('error', 'You must be signed in');
        return res.redirect('/login'); //redirect them to the login page
    }
    next(); //if you're authenticated, you're good to go
}

//using the Joi validator
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); //we're destructuring to get error from the req.body, if available
    if(error) { //so if there's an actually error
        const msg = error.details.map(el => el.message).join(',') //so we're mapping over the array of object error.details returns so it gets turned into a string and then using comma to join them if more than one word
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//using the Joi validator
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400) 
    } else {
        next();
    }
}


//middleware for campground authorizatiion
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) { //if that campground author is not the same as the id of the current user
        req.flash('error', 'You do not have the permission to do that!');
        return res.redirect(`/campgrounds/${id}`);   
    }
    next();
}

//middleware for review authorizatiion
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) { //if that campground author is not the same as the id of the current user
        req.flash('error', 'You do not have the permission to do that!');
        return res.redirect(`/campgrounds/${id}`);   
    }
    next();
}