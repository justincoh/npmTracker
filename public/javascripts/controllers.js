'use strict';

app.controller('MainCtrl', function($scope, data,populate) {
    var namesInTable =[];
    $scope.message = 'upcase'
    $scope.$on('update',function(){
        $scope.allData = data.getData();
        $scope.packageData = $scope.allData.slice(0,5);
        namesInTable=[];
        $scope.packageData.forEach(function(npmPackage){
            //for quicker lookup
            namesInTable.push(npmPackage.name);
        })
        console.log("namesInTable ",namesInTable)
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
        //passed into table directive, removes pacakge and then
        //re-appends it to the end of the array
        var forRemoval = $scope.packageData.filter(function(el){
            return el.name === packageName;
        })
        data.removeFromData(packageName);
        data.addToData(forRemoval[0]);
    };

    $scope.addToBeginning = function(e){
        var packageName = e.target.innerHTML;
        if(namesInTable.indexOf(packageName)!==-1){ return; }

        var packageForRemoval = $scope.packageData.filter(function(thisPackage){
            return thisPackage.name === e.target.innerHTML;
        })
        data.removeFromData(packageName);
        data.addToBeginning(packageForRemoval[0]); //To keep it on lise
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
            data.push(npmPackage);            
            broadcast();
        },
        removeFromData: function(packageName){
            data = data.filter(function(thisPackage){
                return thisPackage.name !== packageName;
            });
        },
        addToBeginning: function(npmPackage){
            //for display, im using slice(0,5)
            data.unshift(npmPackage);
            broadcast();

        },
        resource: $resource('/data')
    }
});