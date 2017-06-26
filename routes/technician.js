var express = require('express');
var session = require('client-sessions');
var async = require('async');
var route = express.Router();
var User = require('../models/user');
var Teker = require('../models/tekers');
var Admin = require('../models/admin');



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
                Teker.find().select('_id firstname lastname image_url email phone fields message location years_of_experience').limit(50).exec(function(err, teker) {
                    if (!teker) {
                        var error = "An error occured while retrieving Technicians' data, Please try again";
                        res.render('technicians.jade', {errors : error});
                    }else{
                        //var success_msg = "Welcome, "+user.username;
                        res.render('technicians.jade', {data : teker});
                    }
                });
            }
        });
    }else {
        res.redirect('/user/login')
    }
});


//SEARCH ROUTE
route.post('/find', function(req, res) {
    if (req.session && req.session.user) {
        User.findOne({ email : req.session.user} , function(err, user) {
            if(!user){
                req.session.reset();
                res.redirect('/user/login');
            }else{
                req.session.user = user.email;
                res.locals.user = {
                    id : user._id,
                    username: user.username
                };

                req.checkBody('search_string', 'Invalid input!').notEmpty();
    
                var error = req.validationErrors();
                if (error){
                    req.flash('error', 'Search field is required');
                    res.redirect('/technicians');
                }else{
                    var search_string = req.body.search_string;
                    Teker.find({$or:[ {'username':  { $regex : new RegExp(search_string, "i") }}, {'email':  { $regex : new RegExp(search_string, "i") }}, {'firstname': { $regex : new RegExp(search_string, "i") }}, {'lastname': { $regex : new RegExp(search_string, "i") }}, {'phone':  { $regex : new RegExp(search_string, "i") }}, {'location.city': { $regex : new RegExp(search_string, "i") } }, {'location.town': { $regex : new RegExp(search_string, "i") } }, {'location.country': { $regex : new RegExp(search_string, "i") } } ]}).sort({registered_date: -1}).select('_id username firstname lastname phone fields email image_url role message location years_of_experience').exec(function(err, tekers) {
                        if(!(tekers.length > 0)){
                            req.flash('error', 'Technician not found!');
                            res.redirect('/technicians');
                        }else{
                            res.render('technicians.jade', { errors: err, data: tekers});
                        }
                    })
                }
            }
        })
    }else{
        res.redirect('/user/login');
    }

    
});

//FINDING BY CATEGORIES
route.get('/:name', function(req, res) {
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
                Teker.find({fields : req.params.name}).select('_id firstname lastname image_url email phone fields message location years_of_experience').limit(50).exec(function(err, tekers) {
                    if (!tekers) {
                        var error = "An error occured while retrieving Technicians' data, Please try again";
                        res.redirect('/technicians', {errors : error});
                    }else{
                        res.render('technicians.jade', {data : tekers});
                    }
                });
            }
        });
    }else {
        res.redirect('/user/login')
    }
});


module.exports = route;
