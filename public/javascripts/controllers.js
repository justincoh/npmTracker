'use strict';

app.controller('MainCtrl',function($scope,testing){
	$scope.message = 'Will it blend?'
	$scope.resourceTest = function(){
		console.log('FIRED')
		var test = testing.get({
                name: 'Express',
                startDate: '2015-01-01',
                endDate: '2015-01-31'
            }, function(res,err) {
                // console.log('callback args ', res,err)
            }

        )
	}
})


app.factory('testing', function ($resource) {
    return $resource('/data')
});
