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
			scope.d3Test = function(){
				var table = d3.select('table');
				var color = "red";
				if(table.style('background-color')==='rgb(255, 0, 0)'){
					color = 'white';
				}
				table.transition().duration(1000).ease('bounce').style('background-color',color);
			}
		}
	}
})