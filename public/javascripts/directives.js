'use strict';

//Think about whether you really need this

app.directive('summaryTable',function(){
	return {
		restrict: 'E',
		templateUrl:'templates/summaryTable.html',
		scope: {
			summaryData: '='
		},
		link: function(scope,element,attrs){
			console.log('Loaded?')
		}
	}
})