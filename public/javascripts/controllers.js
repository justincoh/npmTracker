'use strict';

app.controller('MainCtrl',function($scope,testing){
	$scope.message = 'Will it blend?'
	$scope.resourceTest = function(){
		console.log('FIRED')
		var test = testing.query({
                name: 'Express',
                startDate: '2015-01-01',
                endDate: '2015-01-05'
            }, function(res,err) {
                console.log('callback res ', res)
                console.log('\n','full args ',arguments)
            }

        )
	}
})


app.factory('testing', function ($resource) {
    return $resource('/data')
});
