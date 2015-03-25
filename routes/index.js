var express = require('express');
var router = express.Router();
var models = require('../models/index.js')
var helpers = require('../models/helpers.js')
var request = require('request');
/* GET home page. */
router.get('/', function(req, res) {

    return res.render('index')
});


router.get('/populate', function(req, res) {
    var msPerDay = 86400000;
    var today = new Date();

    models.npmPackage.find().exec(function(err, docs) {
        // console.log('FIND DOCS ',docs)
        // console.log(today - docs[0].mostRecentDate>msPerDay, today.getHours()>=12)
        if (today - docs[0].mostRecentDate > msPerDay && today.getHours() >= 12) {
            var packageNameArray = [];
            var startDate = docs[0].mostRecentDate.toISOString().slice(0, 10);
            var endDate = today.toISOString().slice(0, 10);

            docs.forEach(function(record){
            	packageNameArray.push(record.name);
            })

            helpers.getDateRangeData(packageNameArray,startDate,endDate);
            
            


            // request(apiCall,function(err,response){
            // 	console.log('response ',response.body)
            // })

            // return res.json(docs);

        } else {

            //limit this to 5
            return res.json(docs);
        }
    });
})













module.exports = router;