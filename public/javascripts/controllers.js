'use strict';

app.controller('MainCtrl', function($scope, data) {
    $scope.message = 'upcase, 5 tick/column limit'
    $scope.$on('update',function(){
        $scope.packageData = data.getData();
    });
    
    data.resource.query({
        populate: 1
    }, function(res, err) {
        data.setData(res);
    });

    $scope.today = new Date();
    $scope.twoDaysAgo = new Date($scope.today.setDate($scope.today.getDate() - 3));
    $scope.lastWeek = new Date($scope.today.setDate($scope.today.getDate() - 10));
    // $scope.seedFrom2013 = new Date("2013-01-01");

    $scope.getData = function() {
        var todayString = $scope.today.toISOString().slice(0, 10);
        var twoDaysAgoString = $scope.twoDaysAgo.toISOString().slice(0, 10); 
        var lastWeekString = $scope.lastWeek.toISOString().slice(0, 10);

        data.resource.query({
            //need query for isArray = true
            //indexing to [0] in setter below
            name: $scope.packageName,
            startDate: '2015-03-01',
            endDate: twoDaysAgoString //for cron job dev
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