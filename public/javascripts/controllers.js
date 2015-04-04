'use strict';

app.controller('MainCtrl', function($scope, data, populate) {
    
    var namesOnScope=[];
    var namesInTable=[];
    //Init        
    populate.query(function(res, err) {
        data.setData(res);
        $scope.allData = data.getData();
        $scope.allData.data.forEach(function(el){
            namesOnScope.push(el.name)
        });
        //Refactor to use data.names TODO
        $scope.packageData = $scope.allData.data.slice(0,1);
        $scope.packageData.forEach(function(el){
            namesInTable.push(el.name);
        });
        console.log($scope.packageData)
    });

    $scope.today = new Date();
    $scope.todayString = $scope.today.toISOString().slice(0, 10); 
    //on scope for display

    $scope.startDate = new Date('2015-01-01');
    $scope.startDateString = $scope.startDate.toISOString().slice(0, 10);
    
    $scope.getNewData = function() {
        if(namesOnScope.indexOf($scope.packageName.toLowerCase()) !==-1 ){
            return $scope.errorMessage = $scope.packageName+' data is already here!'
        }

        data.resource.query({
            //need query for isArray = true
            name: $scope.packageName,
            startDate: $scope.startDateString,
            endDate: $scope.todayString
        }, function(res, err) {
            if(res[0]===0){
                return $scope.errorMessage = 'No data found for package: '+$scope.packageName;
                
            }
            data.addToData(res[0]);
        });
    }

    $scope.removePackage = function(packageName) {
        if($scope.packageData.length===1){
            d3.selectAll('path').remove();
        }
        $scope.packageData = $scope.packageData.filter(function(el) {
            return el.name !== packageName
        });
        namesInTable = namesInTable.filter(function(name){
            return name !== packageName;
        });
    };

    $scope.addPackage = function(packageName) {
        if(namesInTable.indexOf(packageName)!==-1){
            return $scope.lineHighlight(packageName)}
        var packageToAdd = $scope.allData.data.filter(function(el) {
            return el.name === packageName;
        });
        packageToAdd = packageToAdd[0];
        $scope.packageData.push(packageToAdd);
        namesInTable.push(packageToAdd.name);
    };

    $scope.isActive = function(packageName){
        return namesInTable.indexOf(packageName) !== -1 ? 'active':'';
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
    };
});


app.filter('upcase', function() {
    return function(input) {
        if (!input) return;
        return input[0].toUpperCase() + input.slice(1).toLowerCase();
    }
});