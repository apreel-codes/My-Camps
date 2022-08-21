const Campground = require('../models/campground');
const Review = require('../models/review');



module.exports.createReview = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id; //associate an author based on the user's id
    campground.reviews.push(review); //then push it to the author array
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res, next) => {
    const{ id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //mongo syntax for pulling info from an array of something(e.g pulling reviewId from review array)
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted');
    res.redirect(`/campgrounds/${id}`)

}