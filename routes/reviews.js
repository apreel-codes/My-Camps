const express = require('express');
const router = express.Router({mergeParams: true}); //'mergeParams: true' because the review is being passed to a certain id of a campground, this will merge all the params needed inside any reviews route. with this we'll have access to the campground id in a review route
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');
const reviews = require('../controllers/reviews');


//route for the reviews per campground 
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;