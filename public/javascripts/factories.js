app.factory('populate',function($resource){
    return $resource('/populate');
});


app.factory('data', function($resource,$rootScope) {
    var data=[];
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
        },
        addToData: function(npmPackage) {
            npmPackage.downloads.forEach(function(download){
                download.date = new Date(download.date);
            });
            data.push(npmPackage); //come back when you're grabbing new packages
        },
        resource: $resource('/data')
    }
});