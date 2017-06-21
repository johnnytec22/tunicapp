var express = require('express');
var session = require('client-sessions');
var route = express.Router();
var User = require('../models/user');
var Teker = require('../models/tekers');





route.get('/', function(req, res) {
    //checking if a user session exist
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user }, function(err, user) {
            if (!user){
                req.session.reset();
                res.redirect('/user/login');
            }else {
                req.session.user = user.email;
                res.locals.user = {
                    id: user._id,
                    firstname: user.firstname,
                    username: user.username
                };
                Teker.find().select('_id firstname lastname image_url email phone fields message location').limit(50).exec(function(err, teker) {
                    if (!teker) {
                        var error = "An error occured while retrieving Technicians' data, Please try again";
                        req.flash('error', error);
                        res.render('technicians.jade', {error: error});
                    }else{
                        req.flash('success', 'Welcome, '+user.firstname);
                        res.render('technicians.jade', {data : teker});
                    }
                });
            }
        });
    }else {
        res.redirect('/user/login')
    }
});


route.get('/:id', function(req, res) {
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user }, function(err, user) {          
            if (!user){
                req.session.reset();
                res.redirect('user/login');
            }else {
                req.session.user = user.email;
                res.locals.user = {
                    id: user._id,
                    firstname: user.firstname,
                    username: user.username
                };
                Teker.findOne({_id : req.params.id}, function(err, teker) {
                    if (!teker) {
                        req.flash('error', "Problem retrieving technicians' data, please try again");
                        res.redirect('/technician');
                    }else{
                        res.render('technician_detail.jade', {teker : teker});
                    }
                });
            }
        });
    }else {
        res.redirect('/user/login')
    }
});


module.exports = route;
