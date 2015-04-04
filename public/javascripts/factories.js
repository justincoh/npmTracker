app.factory('populate',function($resource){
    return $resource('/populate');
});


app.factory('data', function($resource,$rootScope) {
    var data={};
    return {
        getData: function() {
            return data;
        },
        setData: function(args) {
            var names=[];
            //Converting back to real dates, for filtering/sorting
            args.forEach(function(npmPackage){
                names.push(npmPackage.name);
                npmPackage.downloads.forEach(function(download){
                    download.date = new Date(download.date);
                });
            });
            data.data = args;
            data.names = names;
        },
        addToData: function(downloadArray) {
            var obj ={};
            var packageName = downloadArray[0].name;
            data.packageName = downloadArray;
        },
        resource: $resource('/data')
    }
});