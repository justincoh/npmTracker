'use strict';

app.controller('MainCtrl', function($scope, data) {
    $scope.message = 'Concat and minify before deploying'
    
    data.query({populate:1},function(res,err){
        $scope.everything = res;
    });
	

    $scope.resourceTest = function() {
    	var today = new Date();
    	var todayString = today.toISOString().slice(0,10);
    	var lastWeek = new Date(today.setDate(today.getDate()-7));
    	var lastWeekString = lastWeek.toISOString().slice(0,10);

        data.get({
                //Hardocding for dev purposes, getting display right
                name: 'Gulp',
                startDate: lastWeekString,
                endDate: todayString
            }, function(res, err) {
                console.log('Get res ',res)
                $scope.everything = res;
            }

        )
    }
});


app.factory('data', function($resource) {
    return $resource('/data');
});