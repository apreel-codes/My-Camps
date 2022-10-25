const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor } = require('../middleware');
const campgrounds = require('../controllers/campgrounds'); //campgrounds variable is now an object that now has different methods to it (from controllers)
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.route('/')
    .get(catchAsync(campgrounds.index)) //show all camps //pass in campgrounds.index(index is now a method on campgrounds) from the controllers.js
    .post(isLoggedIn, upload.array('image'), catchAsync(campgrounds.createNewCamp)); //image here is the name given to the input type on the form //where it submits to(this should be only possible for who is logged in)
    

//to create a new camp(this should be only possible for who is logged in)
router.get('/new',isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(campgrounds.showCamp) //to show details of one camp
    .put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(campgrounds.updateCamp)) //where to submit to(this should be only possible for who is logged in)
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCamp)); //to delete (this should be only possible for who is logged in)
    

//to edit(this should be only possible for who is logged in)
router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));


module.exports = router;