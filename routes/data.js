'use strict';
var express = require('express');
var router = express.Router();
var models = require('../models/index.js');
var request = require('request');
var dailyUpdate = require('../models/cronJob.js');

//kicking off cron
dailyUpdate.start();

//need a good way to determine which dates are in the database
//could pre-populate everything with certain amount for the project's sake
//and then incrementally go forward
//Or if I don't have the package, run a seed function going back to x date through present
//need to make sure I can query based on a date range though, if the data is already in the db
router.get('/?', function(req, res) {
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var packageName = req.query.name;

    console.log('req query ',req.query)
    //This isn't set up to handle initial resource.query
    //need to pass a param for initial load query



    if (typeof req.query.populate !== 'undefined') {
        models.npmPackage.find(function(err, docs) { //limit this
            return res.json(docs);
        })
    } else {
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
                    // console.log('Obj for write ', obj)
                        // models.npmPackages.update({name:packageName},obj,{upsert:true},function(err,numAffected){
                        //  if(err){console.log('UPSERT ERR ',err)};
                        //  return res.json(obj);
                        // });

                    var newPackage = new models.npmPackage({
                        name: obj['package'],
                        downloads: obj.downloads
                    });
                    newPackage.save(function(err, doc) {
                        if (err) {
                            throw 'Error Inserting Document ' + err
                        }
                        return res.json(doc);
                    })


                });
            } else {

                return res.json(docs);
            }
        });
    }

});


module.exports = router;