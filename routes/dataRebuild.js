'use strict';
var express = require('express');
var router = express.Router();
var models = require('../models/indexRebuild.js');
var request = require('request');
var async = require('async');

router.get('/?', function(req, res) {
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var packageName = req.query.name;

    console.log('Req query ', req.query)

    var databasePromise = models.Downloads.find({
            packageName: packageName
        })
        .exec();

    databasePromise.then(function(docs) {
        if (docs.length === 0) {
            //go to api and get it
            var rangeByDate = 'https://api.npmjs.org/downloads/range/' + startDate + ':' + endDate + '/' + packageName;
            request(rangeByDate, function(err, response) {
                console.log
                var responseObj = JSON.parse(response.body)
                console.log('RESPONSE ', responseObj)
                if (responseObj.hasOwnProperty("error")) {
                    console.log('HERE')
                    return res.json([responseObj])
                }



                var newPackage = new models.PackageInfo({
                    name: responseObj['package'].toLowerCase()
                })

                newPackage.save(function(err, doc) {
                    if (err) {
                        console.log('Error Saving Package Info: ', err);
                        return res.json([err])
                    }
                    //returned doc has _id, fill download records now
                    var downloadRecords = responseObj.downloads;
                    downloadRecords.forEach(function(el) {
                        el.date = new Date(el.day)
                    })
                    async.each(downloadRecords, function(record, callback) {
                            var newDownloadRecord = new models.Downloads({
                                date: record.date,
                                downloads: record.downloads,
                                packageInfo: doc._id,
                                packageName: doc.name

                            });
                            newDownloadRecord.save(function(subErr, subDoc) {
                                callback(subErr)
                            })
                        },
                        function(err) {
                            if (err) {
                                console.log(err);
                                return res.json([err])
                            }
                            models.Downloads.find({
                                packageName: doc.name
                            }, function(err, mongoResponse) {
                                if (err) {
                                    console.log(err);
                                    return res.send(err)
                                }
                                console.log('DB Response ', mongoResponse)
                                return res.json(mongoResponse);
                            })
                        }

                    )
                })



            })

        } else {
            console.log("HERE ",docs)
            //delete this after dev, front end validation means this should never happen
            return res.json(docs)

        }
    });


});


module.exports = router;