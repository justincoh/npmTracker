app.factory('populate',function($resource){
    return $resource('/populate');
});


app.factory('data', function($resource,$rootScope) {
    var data=[];
    // var displayData =[];
    //data will always be an array based on backend structure
    // var broadcast = function(){
    //     $rootScope.$broadcast('update');
    // };
    return {
        getData: function() {
            return data;
        },
        // getDisplayData: function(){
        //     return displayData;
        // },
        setData: function(args) {
            //Converting back to real dates, for filtering/sorting
            args.forEach(function(npmPackage){
                npmPackage.downloads.forEach(function(download){
                    download.date = new Date(download.date);
                });
            });
            data = args;
            displayData = data.slice(0,3);
            //broadcast();
        },
        addToData: function(npmPackage) {
            npmPackage.downloads.forEach(function(download){
                download.date = new Date(download.date);
            });
            data.push(npmPackage);            
            //broadcast();
        },
        removeFromData: function(packageName){  
            //this should probably never be invoked, unless i create a new displaydata?
            data = data.filter(function(thisPackage){
                return thisPackage.name !== packageName;
            });
        },
        addToBeginning: function(npmPackage){
            //for display, im using slice(0,5)
            data.unshift(npmPackage);
            //broadcast();

        },
        resource: $resource('/data')
    }
});