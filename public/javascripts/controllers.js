'use strict';

app.controller('MainCtrl',function($scope,testing){
	$scope.message = 'Will it blend?'
	$scope.resourceTest = function(){
		console.log('FIRED')
		var test = testing.get({id:1,test:2,another:3})
	}
})


angular.module('npmTracker')
  .factory('testing', function ($resource) {
    return $resource('/data')
});
