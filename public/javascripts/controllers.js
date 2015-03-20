'use strict';

app.controller('MainCtrl',function($scope,testing){
	$scope.message = 'Will it blend?'
	$scope.resourceTest = function(){
		console.log('FIRED')
		var test = testing.query()
		console.log(test)
	}
})


angular.module('npmTracker')
  .factory('testing', function ($resource) {
    return $resource('/data/:id',{id:'@_id'})
});
