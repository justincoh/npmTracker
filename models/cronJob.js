var CronJob = require('cron').CronJob;
var request = require('request');
var models = require('./index.js');
var async = require('async');

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

        getYesterday(packageNames);
    })
};
dailyUpdate();

var getYesterday = function(packageNameArray) {
    var packagesToGet = packageNameArray.join(',');
    var apiCall = 'https://api.npmjs.org/downloads/point/last-day/' + packagesToGet;
    //seriously friendly api

    request(apiCall, function(err, response) {
        var obj = JSON.parse(response.body);
        //sends everything as one object, key for each package
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                var thisPackage = obj[key];
                thisPackage.day = thisPackage.end;
                thisPackage.date = new Date(thisPackage.end);
                delete thisPackage['start']; //wonder how costly this is vs copying
                delete thisPackage['end'];
            }
        }
        return updateRecords(obj);
    });
};

var updateRecords = function(packageObject) {
    //convert to array for async map
    var packageArray = Object.keys(packageObject).map(function(k) {
        return packageObject[k];
    });
    
    async.map(packageArray, function(item, callback) {
        models.npmPackage.update({name: item['package']}, 
	        {$addToSet: {
	                downloads: {
	                    day: item.day,
	                    date: item.date,
	                    downloads: item.downloads
	                }
	            }
	        }, function(err,doc){
	        	callback(err,item['package']);
	        }
        );
    }, function(err, res) {
    	if(err){return console.error('CronJob Error: ',err)}
        return console.log('CronJob Successful, packages updated: ', res);
    });

}