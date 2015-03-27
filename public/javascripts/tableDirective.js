'use strict';

app.directive('summaryTable', function(data) {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryTable.html',
        link: function(scope, element, attrs) {
            scope.rowHandler = function(e) {
                var thisPackage = this.data.name;
                //if they clicked the remove button, remove
                if (e.target.className.split(' ').indexOf('remove') !== -1) {
                    //classList was erroring, doesn't have indexOf method apparently
                    scope.removePackage(thisPackage)
                } else {
                    scope.lineHighlight(thisPackage)
                }
            }
        }
    }
})
