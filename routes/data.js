'use strict';
var express = require('express');
var router = express.Router();
var models = require('../models/index.js');
var request = require('request');

//Example API Calls
//Broken by day: https://api.npmjs.org/downloads/range/2014-01-03:2014-02-03/jquery


//need a good way to determine which dates are in the database
//could pre-populate everything with certain amount for the project's sake
//and then incrementally go forward
//Or if I don't have the package, run a seed function going back to x date through present
//need to make sure I can query based on a date range though, if the data is already in the db
router.get('/?', function(req, res) {
    // console.log('Req Query ',req.query)
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var packageName = req.query.name;
    var junk = req.query.junk;

    
    var databasePromise = models.npmPackages.findOne({
        name: packageName 
        //this needs to check against the dates being entered, not just against the package name
    }).exec();

    databasePromise.then(function(docs) {
        if (docs === null) { 
            //go to api and get it
            var rangeByDate = 'https://api.npmjs.org/downloads/range/' + startDate + ':' + endDate + '/' + packageName;
            request(rangeByDate, function(err, response) {
                var obj = JSON.parse(response.body)
                var downloads = obj.downloads;
                downloads.forEach(function(record, i) {
                    //converting to date objects before writing to db
                    //Might want to leave the datestring also, for checking DB before hitting API

                    record.day = new Date(record.day);
                })
                obj.downloads = downloads //resetting obj for DB write
                models.npmPackages.update({name:packageName},obj,{upsert:true})
                return res.json(downloads);
            })
        } else{
        	return res.json(docs);
        }
        // console.log("databasePromise res ",res)
    })

});


module.exports = router;