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
    
    //This isn't set up to handle initial resource.query
    //need to pass a param for initial load query

    var databasePromise = models.npmPackages.findOne({name: packageName})
    			.exec();

    databasePromise.then(function(docs) {
        if (docs === null) { 
            //go to api and get it
            var rangeByDate = 'https://api.npmjs.org/downloads/range/' + startDate + ':' + endDate + '/' + packageName;
            request(rangeByDate, function(err, response) {
                var obj = JSON.parse(response.body)
                var downloads = obj.downloads;
                downloads.forEach(function(record, i) {
                	//adding actual Date field for sorting later
                    record.date = new Date(record.day);
                });
                //resetting obj for DB write
                obj.downloads = downloads; 
                
                models.npmPackages.update({name:packageName},obj,{upsert:true},function(err,numAffected){
                	if(err){console.log('UPSERT ERR ',err)};
                	return res.json(obj);
                });
            });
        } else{
        	return res.json(docs);
        }
    });

});


module.exports = router;