var express = require('express');
var route = express.Router();
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var session = require('client-sessions');

//LOGIN ROUTES
route.get('/login', function(req, res) {
    res.render('login.jade');
});

//submitting login form
route.post('/login', function(req, res) {
    var querry = {username: req.body.username};
    
    User.findOne(querry, function(err, user) {
        if (!user) {
            req.flash('error', 'Incorrect username or password')
            res.render('login.jade');
        }else {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                req.session.user = user.email;
                res.redirect('/technicians');
            }else{
                req.flash('error', 'Incorrect username or passwor')
                res.render('login.jade');
            }
        }

    });
});

//REGISTER ROUTE
route.get('/register', function(req, res) {
    res.render('register.jade');
});



route.post('/register', function(req, res) {

    req.checkBody('password', 'Password Required').notEmpty();
    var error = req.validationErrors();

    if (error){
        req.flash('error', error[0].msg);
        res.render('register.jade');
    }else{
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(req.body.password, salt);

        var user_location = {
            town: req.body.town,
            city: req.body.city,
            country: req.body.country
        }
        var user = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone: req.body.phone,
            email: req.body.email,
            address: req.body.address,
            location: user_location,
            username: req.body.username,
            password: hash
        };
        
        User.create(user, function(err, user) {
            if (err) {
                var error = "Empty required field, Please do try again!";

                if (err.code === 11000) {
                    error = "Email or Username Already exist"
                }
                req.flash('error', error);
                res.render('register.jade');
            }else{
                req.session.user = user.email;
                res.redirect('/technicians');
            }

        });
    }

    
})

route.get('/logout', function(req, res) {
    req.session.reset();
    res.redirect('/');
});

module.exports = route;