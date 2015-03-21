'use strict';

app.controller('MainCtrl', function($scope, data) {
    $scope.message = 'Concat and minify before deploying'
    data.query(function(res,err){
    	$scope.everything = res;
    });
    $scope.resourceTest = function() {
        data.get({
                //Hardocding for dev purposes, getting display right
                name: 'Express',
                startDate: '2015-01-01',
                endDate: '2015-01-31'
            }, function(res, err) {
                console.log('callback res ', res);
                $scope.data = res;
            }

        )
    }
});


app.factory('data', function($resource) {
    return $resource('/data');
});