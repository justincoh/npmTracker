'use strict';

app.controller('MainCtrl', function($scope, data) {
    $scope.message = 'config gulp'
    $scope.$on('update',function(){
        $scope.packageData = data.getData();
    console.log(typeof $scope.packageData[0].downloads[0].date)
    });
    
    data.resource.query({
        populate: 1
    }, function(res, err) {
        data.setData(res);
    });

    $scope.today = new Date();
    $scope.lastWeek = new Date($scope.today.setDate($scope.today.getDate() - 10));
    $scope.seedFrom2013 = new Date("2013-01-01");

    $scope.getData = function() {
        var todayString = $scope.today.toISOString().slice(0, 10);
        var lastWeekString = $scope.lastWeek.toISOString().slice(0, 10);

        data.resource.query({
            //need query for isArray = true
            //indexing to [0] in setter below
            name: $scope.packageName,
            startDate: lastWeekString,
            endDate: todayString
        }, function(res, err) {
            data.addToData(res[0]);
        });
    }
});


app.factory('data', function($resource,$rootScope) {
    var data;
    //data will always be an array based on backend structure
    var broadcast = function(){
        $rootScope.$broadcast('update');
    };
    return {
        getData: function() {
            return data;
        },
        setData: function(args) {
            //Converting back to real dates, for filtering/sorting
            args.forEach(function(npmPackage){
                npmPackage.downloads.forEach(function(download){
                    download.date = new Date(download.date);
                });
            });
            data = args;
            broadcast();
        },
        addToData: function(npmPackage) {
            npmPackage.downloads.forEach(function(download){
                download.date = new Date(download.date);
            });
            data.push(npmPackage);
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