'use strict';
var express = require('express');
var router = express.Router();
var models = require('../models/index.js');
var request = require('request');
var dailyUpdate = require('../models/cronJob.js');

//kicking off cronJob
dailyUpdate.start();

router.get('/?', function(req, res) {
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var packageName = req.query.name;

    if (typeof req.query.populate !== 'undefined') {//checking initial page load
        models.npmPackage.find(function(err, docs) { //limit this
            return res.json(docs);
        })
    } 




    else { //Every request other than page load
        var databasePromise = models.npmPackage.find({
                name: packageName
            })
            .exec();

        databasePromise.then(function(docs) {
            if (docs.length === 0) {
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

                    var newPackage = new models.npmPackage({
                        name: obj['package'],
                        downloads: obj.downloads
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
    }
});


module.exports = router;