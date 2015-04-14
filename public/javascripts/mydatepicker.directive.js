app.directive('mydatepicker', function() {
    return {
        restrict: "E",
        scope: {
            date: "=",
            dateOptions: "=",
            opened: "=",
            desc: '@'
        },
        link: function(scope, element, attrs) {
            scope.open = function(event) {
                console.log(scope.date);
                event.preventDefault();
                event.stopPropagation();
                scope.opened = true;
            };

            scope.clear = function() {
                scope.date = null;
            };
        },

        templateUrl: 'templates/mydatepicker.html',
    }
})
