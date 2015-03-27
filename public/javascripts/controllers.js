'use strict';

app.controller('MainCtrl', function($scope, data, populate) {
    var namesInTable = [];

    //fill Data
    populate.query(function(res, err) {
        data.setData(res);
    });

    $scope.$on('update', function() {
        $scope.allData = data.getData();
        // $scope.packageData = $scope.allData.slice(0, 5);
        $scope.packageData = data.getDisplayData();

        namesInTable = [];
        $scope.packageData.forEach(function(npmPackage) {
            //for quicker lookup later
            namesInTable.push(npmPackage.name);
        })
    });


    $scope.today = new Date(); //Leaving on scope for sorting, for now
    $scope.todayString = $scope.today.toISOString().slice(0, 10); //on scope for display

    $scope.startDate = new Date('2015-01-01');
    $scope.startDateString = $scope.startDate.toISOString().slice(0, 10);
    $scope.getData = function() {
        data.resource.query({
            //need query for isArray = true
            //indexing to [0] in setter below
            name: $scope.packageName,
            startDate: $scope.startDateString,
            endDate: $scope.todayString
        }, function(res, err) {
            data.addToData(res[0]);
        });
    }

    $scope.removePackage = function(packageName) {
        //passed into table directive, removes pacakge and then
        //re-appends it to the end of the array
        // var forRemoval = $scope.packageData.filter(function(el) {
        //     return el.name === packageName;
        // })
        // data.removeFromData(packageName);
        // data.addToData(forRemoval[0]);
        $scope.packageData = $scope.packageData.filter(function(el){
            return el.name !==packageName
        })
    };

    $scope.addPackage = function(e){
        var packageName = this.data.name;
        var packageToAdd = $scope.allData.filter(function(el){
            console.log(el.name===packageName)
            return el.name === packageName;
        })
        $scope.packageData.push(packageToAdd[0])
        
    }


    $scope.lineHighlight = function(packageName) {
        d3.selectAll('.line').transition()
            .duration(500)
            .ease('bounce')
            .style('stroke-width', '2px');
        d3.select('.' + packageName) //select returns first in DOM traversal order
            .transition()
            .duration(1000)
            .ease('bounce')
            .style('stroke-width', '8px')
    }


    $scope.addToBeginning = function(e) {
        var packageName = e.target.innerHTML.toLowerCase();
        if (namesInTable.indexOf(packageName) !== -1) {
            $scope.lineHighlight(packageName);
            return;
        }

        var packageForRemoval = $scope.allData.filter(function(thisPackage) {
            return thisPackage.name === packageName;
        });
        data.removeFromData(packageName);
        data.addToBeginning(packageForRemoval[0]); //To keep it on list
    }

});


app.filter('upcase', function() {
    return function(input) {
        if (!input) return;
        return input[0].toUpperCase() + input.slice(1);
    }
});