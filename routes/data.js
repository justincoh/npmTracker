'use strict';
var express = require('express');
var router = express.Router();
var models = require('../models/index.js');
var request = require('request');
// var cronJob = require('../models/cronJob.js').job;

//kicking off cronJob
// cronJob.start();

router.get('/?', function(req, res) {
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var packageName = req.query.name;

    var databasePromise = models.npmPackage.find({
            name: packageName
        })
        .exec();

    databasePromise.then(function(docs) {
        if (docs.length === 0) {
            //go to api and get it
            var rangeByDate = 'https://api.npmjs.org/downloads/range/' + startDate + ':' + endDate + '/' + packageName;
            request(rangeByDate, function(err, response) {
                var responseObj = JSON.parse(response.body)
                if(responseObj.hasOwnProperty("error")){
                    return res.send([0]);
                }
                var downloads = responseObj.downloads;
                downloads.forEach(function(record, i) {
                    //adding actual Date field for sorting later
                    record.date = new Date(record.day);
                });
                //resetting responseObj for DB write
                responseObj.downloads = downloads;

                var newPackage = new models.npmPackage({
                    name: responseObj['package'],
                    downloads: responseObj.downloads
                });
                newPackage.save(function(err, doc) {
                    if (err) {
                        throw 'Error Inserting Document ' + err
                    }
                    //has to be array for $resource config
                    return res.json([doc]);
                })
            });
        } else {
            return res.json(docs);
        }
    });
});


module.exports = router;