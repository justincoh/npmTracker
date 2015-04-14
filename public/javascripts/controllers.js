'use strict';

app.controller('MainCtrl', function($scope, data, populate) {

    //Testing Datepicker
    // $scope.formData = {};
    // $scope.formData.date = "";
    $scope.opened = false;
    $scope.date1 = '';
    $scope.date2 = '';

    $scope.dateOptions = {
        'year-format': "'yy'",
        'show-weeks': false
    };
    ///End datepicker


    var namesOnScope = [];
    var namesInTable = [];
    //Init        
    populate.query(function(res, err) {
        data.setData(res);
        $scope.allData = data.getData();
        $scope.allData.data.forEach(function(el) {
            namesOnScope.push(el.name)
        });
        //Refactor to use data.names TODO
        $scope.packageData = $scope.allData.data.filter(function(el) {
            return el.name === 'lodash' || el.name === 'underscore'
        });
        $scope.packageData.forEach(function(el) {
            namesInTable.push(el.name);
        });
    });

    $scope.endDate = new Date();
    $scope.startDate = new Date('2015-01-02');
    

    $scope.getNewData = function() {
        if (namesOnScope.indexOf($scope.packageName.toLowerCase()) !== -1) {
            return $scope.errorMessage = $scope.packageName + ' data is already here!'
        }

        var startDateString = $scope.startDate.toISOString().slice(0, 10);
        var endDateString = $scope.endDate.toISOString().slice(0, 10);
        data.resource.query({
            //need query for isArray = true
            name: $scope.packageName,
            startDate: startDateString,
            endDate: endDateString
        }, function(res, err) {
            if (res[0] === 0) {
                return $scope.errorMessage = 'No data found for package: ' + $scope.packageName;

            }
            data.addToData(res[0]);
        });
    }

    $scope.removePackage = function(packageName) {
        if ($scope.packageData.length === 1) {
            d3.selectAll('path').remove();
            d3.selectAll('.datapoints').remove();
            d3.selectAll('.legend').remove();
        }
        $scope.packageData = $scope.packageData.filter(function(el) {
            return el.name !== packageName
        });
        namesInTable = namesInTable.filter(function(name) {
            return name !== packageName;
        });
    };

    $scope.addPackage = function(packageName) {
        if (namesInTable.indexOf(packageName) !== -1) {
            return $scope.lineHighlight(packageName)
        }
        var packageToAdd = $scope.allData.data.filter(function(el) {
            return el.name === packageName;
        });
        packageToAdd = packageToAdd[0];
        $scope.packageData.push(packageToAdd);
        namesInTable.push(packageToAdd.name);
    };

    $scope.isActive = function(packageName) {
        return namesInTable.indexOf(packageName) !== -1 ? 'active' : '';
    }


    $scope.lineHighlight = function(packageName) {
        d3.selectAll('.line').transition()
            .duration(500)
            .ease('bounce')
            .style('stroke-width', '2px');
        d3.select('.' + packageName + ' .line')
            .transition()
            .duration(1000)
            .ease('bounce')
            .style('stroke-width', '8px')
    };

    $scope.changeDates = function(defaults) {
        if (defaults) {
            $scope.startDate = new Date('2015-01-02');
            $scope.endDate = new Date();
        } else {
            if (!$scope.setDates || $scope.setDates === false) {
                $scope.setDates = true;
            } else {
                $scope.setDates = false
            }
        }
    };

});



app.filter('upcase', function() {
    return function(input) {
        if (!input) return;
        return input[0].toUpperCase() + input.slice(1).toLowerCase();
    }
});

