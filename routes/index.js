var express = require('express');
var router = express.Router();
var models = require('../models/index.js')
var helpers = require('../models/helpers.js')
var request = require('request');
var async = require('async');
var q = require('q');

/* GET home page. */
router.get('/', function(req, res) {

    return res.render('index')
});

//On page load
router.get('/populate', function(req, res) {
    var msPerDay = 86400000;
    var today = new Date();

    models.npmPackage.find().exec(function(err, docs) {
        if (docs.length === 0) {
            return res.status(200).send()
        }

        //find min most recentdate and go off of that
        var minDate = docs[0].mostRecentDate;
        docs.forEach(function(entry){
        	if(entry.mostRecentDate < minDate){
        		minDate = entry.mostRecentDate;
        	}
        });
        

        if ((today - minDate > msPerDay * 2) && (today.getHours() >= 12)) {
            console.log('timediff ', today - docs[0].mostRecentDate)
            var packageNameArray = [];
            var startDate = docs[0].mostRecentDate.toISOString().slice(0, 10);
            var endDate = today.toISOString().slice(0, 10);

            docs.forEach(function(record) {
                packageNameArray.push(record.name);
            })

            async.series([
                function(callback) {	//update the DB
                    var defer = q.defer();
                    q(helpers.getDateRangeData(packageNameArray, startDate, endDate)).then(function(value) {
                        callback(null);
                    });
                },
                function(callback) { //get all from DB after update
                    models.npmPackage.find().exec(function(mongoErr, mongoRes) {
                        callback(null, mongoRes)
                    });
                }
            ], function(asyncErr, asyncRes) {
                //send results to front end
                return res.json(asyncRes[1]) //second element is the docs
            });

        } else {
            //limit this to 5
            return res.json(docs);
        }
    });
});


module.exports = router;