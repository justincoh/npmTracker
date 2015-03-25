var CronJob = require('cron').CronJob;
var request = require('request');
var models = require('./index.js');
var async = require('async');

//This Cron Job checks daily for the 'lastday' data for all packages that are in the database
//It also REQUIRES that there is more than 1 package in the database as is
//fortunately that isnt a problem, should probably still refactor though TODO

//this will currently add a dupe one time only, figure out why TODO

//Also add check to API return values TODO
//it's sending mixed last-day dates depending on call/package


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
	        {
	        	$addToSet: {
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
    	if(err){return console.error('CronJob Error: ',err);}
        
        models.npmPackage.recalculateTotals(); 
        models.npmPackage.recalculateMostRecent();
        //mongoose doesn't do pre('update'), so do it with a static
        return console.log('CronJob Successful, packages updated: ', res, Date());
    });

}

var databaseUpdate = new CronJob('0 0 12 * * *',dailyUpdate);


//calling function here as well
//Heroku kills dynos that aren't being used, but spins them up once per day
//this guarantees a call at least once per day
dailyUpdate();

module.exports = databaseUpdate;


