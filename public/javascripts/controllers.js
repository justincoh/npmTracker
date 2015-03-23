'use strict';

app.controller('MainCtrl', function($scope, data) {
    $scope.message = 'Concat and minify before deploying'
    $scope.$on('update',function(){
        $scope.packageData = data.getData();
    });
    
    data.resource.query({
        populate: 1
    }, function(res, err) {
        data.setData(res);
    });


    $scope.getData = function() {
        $scope.today = new Date();
        var todayString = $scope.today.toISOString().slice(0, 10);
        $scope.lastWeek = new Date($scope.today.setDate($scope.today.getDate() - 7));
        var lastWeekString = $scope.lastWeek.toISOString().slice(0, 10);

        data.resource.get({
            //Hardocding for dev purposes, getting display right
            name: $scope.packageName,
            startDate: lastWeekString,
            endDate: todayString
        }, function(res, err) {
            console.log('Get res ', res)
            data.addToData(res);
        })
    }
});


app.factory('data', function($resource,$rootScope) {
    var data;
    var broadcast = function(){
        $rootScope.$broadcast('update');
    };
    return {
        getData: function() {
            return data;
        },
        setData: function(args) {
            //args will always be an array based on backend structure
            data = args;
            broadcast();
        },
        addToData: function(object) {
            data.push(object);
            broadcast();
        },
        removeFromData: function(packageName){
            data = data.filter(function(thisPackage){
                return thisPackage.name !==packageName;
            });
            broadcast();
        },
        resource: $resource('/data')
    }
});