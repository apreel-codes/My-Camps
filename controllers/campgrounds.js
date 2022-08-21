const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary'); //import cloudinary from cloudinary folder for the deleteImage, so we delete it completely from cloudinary
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); //this alrready contains both forward and reverse geocoding

//for the index route, the require this on the route file
module.exports.index = async(req, res, next) => {
    const allcamps = await Campground.find({}).populate('author'); 
    res.render('campgrounds/index', { allcamps });
}

//for the render new campground form
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

//to submit newly created camp
module.exports.createNewCamp = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode(({
        query: req.body.campground.location,
        limit: 1
    })).send()
    const newCampground = new Campground(req.body.campground); //req.body conatains the new thing added, then .campground means we're parsing it to the existing campground db
    newCampground.geometry = geoData.body.features[0].geometry; //set the geometry to the object geoData.body.features[0].geometry returns
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); //map over the req.files coming from req(thanks to multer), take the path and filename and create new object for each one(image) so we end up with an array of images
    newCampground.author = req.user._id;//this takes the id of the currently logged in user and set it as the author the campground created
    await newCampground.save();
    console.log(newCampground);
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${newCampground._id}`);
}

//to show one camp
module.exports.showCamp = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate(
        { path: 'reviews', //this will populate the reviews on each campground
        populate: {
            path: 'author' //then populate each author on each review
        }
    }).populate('author'); //populate author of each campground
    if(!campground){ //if the id passed doesn't exist
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds'); //then go back to the index page
    }
    res.render('campgrounds/show', { campground });
}

//to edit camp
module.exports.renderEditForm = async (req, res, next) => {  //need to get the product first
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){ //if the id passed doesn't exist
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds'); //then go back to the index page
    }
    res.render('campgrounds/edit', { campground });
}

//to submit edited camp
module.exports.updateCamp = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground } );
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename })); //map over the (new images to be uploaded)req.files coming from req(thanks to multer), this returns an array
    campground.images.push(...imgs); //taking the data from the array(imgs) above and push it into the existing images array bcos an array can't be directly passed into an array
    await campground.save();
    if(req.body.deleteImages){ //if there are images to delete
        for(let filename of req.body.deleteImages){ //for each file present in our deleteImages array
            await cloudinary.uploader.destroy(filename); //remove them from cloudinary
        }
        //now pull from the campground.images array, all images with filename also present in req.body.deleteImages
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}});
    }
    
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

//to delete camp
module.exports.deleteCamp = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted');
    res.redirect('/campgrounds');
}
