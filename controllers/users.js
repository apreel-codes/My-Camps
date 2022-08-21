const User = require('../models/user');

//render register form
module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}


//to register user
module.exports.registerUser = async (req, res) => {
    try{
        const { email, username, password } = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password); //the 'user' is the one created above, while thw password is taked already from the destructuring and passed into this place
        req.login(registeredUser,err => { //this will directly login a newly registered user
            if(err) return next(err);
            req.flash('success', 'Welcome to Mycamp');
            res.redirect('/campgrounds');
        })       
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

//render login form
module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

//to login user
module.exports.loginUser = (req, res) => { //we pass in passport.authenticate ('local' is anything we want to use to authenticate, could be facebook, google account etc), (failureRedirect: '/login') will redirect back to login page if there's a failure logging in
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'; //if a user logs in, they could either be going directly to the campgrounds or redirected from a particular route
    delete req.session.returnTo; //clear that url from the req.session object
    res.redirect(redirectUrl);
}

//to logout a user
module.exports.logoutUser = (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            return next(err); 
        }
        req.flash('success', "Logged you out!");
        res.redirect('/campgrounds');
    })
}