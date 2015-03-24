var CronJob = require('cron').CronJob;
var request = require('request');
var models = require('./index.js');

var getYesterday = function(packageNameArray){
	var packagesToGet = packageNameArray.join(',');
	var apiCall = 'https://api.npmjs.org/downloads/point/last-day/'+packagesToGet; 
	//seriously friendly api
	
	request(apiCall,function(err,response){
		console.log(response.body)
		var obj = JSON.parse(response.body);
		console.log('obj ',obj)
		// var downloads = obj.downloads;
		// console.log(obj,downloads)
		return;
	});
}

//Needs to check daily for the 'lastday' data for all packages that are in the database
var dailyUpdate = function() {
    models.npmPackage.find().select('name').exec(function(err, res) {
        if (err !== null) {
            return console.error('Error: ' + err)
        }
        var packageNames = [];
        res.forEach(function(entry) {
            packageNames.push(entry.name)
        });

        //this is a perfect case for async.map
        getYesterday(packageNames);
    })
};



dailyUpdate();