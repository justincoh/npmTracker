'use strict';

app.controller('MainCtrl', function($scope, data) {
    $scope.message = 'Concat and minify before deploying'
    
    data.query({populate:1},function(res,err){
        $scope.everything = res;
    });
	

    $scope.resourceTest = function() {
    	$scope.today = new Date();
    	var todayString = $scope.today.toISOString().slice(0,10);
    	$scope.lastWeek = new Date($scope.today.setDate($scope.today.getDate()-7));
    	var lastWeekString = $scope.lastWeek.toISOString().slice(0,10);

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