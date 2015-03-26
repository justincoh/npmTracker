var request = require('request');
var models = require('./index.js');
var async=require('async');


var getDateRange = function(packagesToGet,startDate,endDate) {
    console.log(startDate,endDate)
    var packageString = packagesToGet.join(',');
    var apiCall = 'https://api.npmjs.org/downloads/range/'+startDate+':'+endDate+'/' + packageString;
    //seriously friendly api
    console.log(apiCall)

    request(apiCall, function(err, response) {
        var obj = JSON.parse(response.body);
        //sends everything as one object, key for each package
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                var thisPackage = obj[key];
                //adding real date to each entry
                thisPackage.downloads.forEach(function(entry){
                    entry.date = new Date(entry.day);
                })
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

        // console.log('packageArray ',packageArray)
        // console.log('ITEM.downloads ',item.downloads)
        //looks like i need to nest async calls, itm.downloads is an array also
        models.npmPackage.update({name: item['package']}, 
            {
                $addToSet: {    //Use $push $each, just double check your dates first
                    downloads: {
                        $each: item.downloads
                        //$sort: {date:1}
                    }
                }
            }, function(err,doc){
                callback(err,item['package']);
            }
        );
    }, function(err, res) {
        if(err){return console.error('helpers.js Error: ',err);}
        models.npmPackage.recalculateTotals(); 
        models.npmPackage.recalculateMostRecent();
        //mongoose doesn't do pre('update'), so do it with a static
        // console.log('RES FROM HELPERS ',res, Date.now())
        return res;
        // return res.status(418).send();
    });

}


module.exports = {
    'getDateRangeData': getDateRange
}