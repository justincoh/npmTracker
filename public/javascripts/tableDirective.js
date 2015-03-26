'use strict';

app.directive('summaryTable', function(data) {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryTable.html',
        scope: {
            summaryData: '=',
            startDate: '=',
            endDate: '=',
            removePackage: '&'
        },
        link: function(scope, element, attrs) {
            scope.rowHandler = function(e) {
                var thisPackage = this.data.name;

                //if they clicked the remove button, remove
                if (e.target.className.split(' ').indexOf('remove') !== -1) {
                    //classList was erroring, doesn't have indexOf method apparently
                    scope.removePackage({packageName: thisPackage})
                    
                } else {
                    d3.selectAll('.line').transition()
                        .duration(500)
                        .ease('bounce')
                        .style('stroke-width', '2px');
                    d3.select('.' + thisPackage) //select returns first in DOM traversal order
                        .transition()
                        .duration(1000)
                        .ease('bounce')
                        .style('stroke-width', '8px')
                }
            }
        }
    }
})
