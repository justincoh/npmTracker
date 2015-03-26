'use strict';

app.controller('MainCtrl', function($scope, data,populate) {
    $scope.message = 'upcase'
    $scope.$on('update',function(){
        $scope.allData = data.getData();
        $scope.packageData = $scope.allData.slice(0,5);
    });
    
    populate.query(function(res,err){
        data.setData(res);
    });

    $scope.today = new Date(); //Leaving on scope for sorting, for now
    $scope.todayString = $scope.today.toISOString().slice(0,10);

    $scope.startDate = new Date('2015-01-01');
    $scope.startDateString = $scope.startDate.toISOString().slice(0,10);
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

    $scope.removePackage = function(packageName){
        console.log('packageName ',packageName)
        var forRemoval = $scope.packageData.filter(function(el){
            console.log('EL NAME ',el.name)
            return el.name === packageName;
        })
        console.log('HERE ',forRemoval)
    }



});

app.factory('populate',function($resource){
    return $resource('/populate');
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
            data.unshift(npmPackage);   
            //unshift because slice(0,5) is used in MainCtrl
            //Not sure if push or unshift is faster, both probably copy (check)
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