'use strict';

var app = angular.module('npmTracker',['ngResource']);


app.directive('summaryChart', function(data) {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryChart.html',
        link: function(scope, element, attrs) {
            scope.$watch('packageData.length', function() {
                if (typeof scope.packageData!=='undefined' && typeof scope.packageData[0]!=='undefined') {
                    scope.buildChart();
                }
            });

            scope.buildChart = function() {

                d3.select('svg').remove(); //for re-rendering

                var data = scope.packageData;
                var color = d3.scale.category10();

                var dateRange = [];
                scope.packageData[0].downloads.forEach(function(el) {
                    //HARDCODED to expect syncd dates
                    //Adjust this to use scope variables instead TODO
                    dateRange.push(el.date)
                });
                var margin = {
                        top: 20,
                        right: 20,
                        bottom: 30,
                        left: 90
                    },
                    width = 1000 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                var x = d3.time.scale()
                    .range([0, width]);
                //Need to adjust both ranges TODO
                var y = d3.scale.linear()
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(d3.time.week, 2) //make this reactive to date range passed
                    .tickFormat(d3.time.format("%Y-%m-%d"));

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

                var line = d3.svg.line()
                    .x(function(d) {
                        return x(d.date);
                    })
                    .y(function(d) {
                        return y(d.downloads);
                    });

                var svg = d3.select("#chart-container").append("svg")
                    // .attr("width", width + margin.left + margin.right)
                    .attr('width', '100%')
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                //converting to actual dates
                data.forEach(function(d) {
                    d.downloads.forEach(function(e) {
                        e.date = new Date(e.date);
                    })
                });

                //for axis scale
                x.domain(d3.extent(dateRange, function(d) {
                    return new Date(d);
                }));

                //d3.max and min wont work since the array is nested
                var getMax = function(arr) {
                    var max = 0;
                    arr.forEach(function(npmPackage) {
                        npmPackage.downloads.forEach(function(day) {
                            if (day.downloads > max) {
                                max = day.downloads;
                            }
                        })
                    })
                    return max;
                };
                var downloadMax = getMax(data);

                var getMin = function(arr) {
                    var min = downloadMax;
                    arr.forEach(function(npmPackage) {
                        npmPackage.downloads.forEach(function(day) {
                            if (day.downloads < min) {
                                min = day.downloads;
                            }
                        })
                    })
                    return min;
                };
                var downloadMin = getMin(data);

                //y axis scale
                y.domain([downloadMin * .75, downloadMax * 1.1]);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(-5," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -85)
                    .attr('x',-175)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Downloads");


                var npmPackage = svg.selectAll('npmPackage')
                    .data(data)
                    .enter().append('g')
                    .attr('class', 'npmPackage');

                npmPackage.append('path')
                    .datum(function(d) {
                        return d;
                    })
                    .attr('class', function(d) {
                        return d.name + ' line'
                    })
                    // .attr('class',function(d){return d.name})
                    .attr('d', function(d) {
                        return line(d.downloads);
                    })
                    .style('stroke', function(d) {
                        return color(d.name);
                    })
                    .style('stroke-linecap', 'round')
                    .style('stroke-linejoin', 'bevel');

                //Building Legend
                //has to stay in here since it needs color.domain()
                var legendRectSize = 18,
                    legendSpacing = 4;

                var legend = svg.selectAll('.legend')
                    .data(color.domain())
                    .enter()
                    .append('g')
                    .attr('class', 'legend')
                    .attr('transform', function(d, i) {
                        var height = legendRectSize + legendSpacing;
                        var offset = height * color.domain().length / 2;
                        // var horz = -2 * legendRectSize;
                        var vert = i * height - offset;
                        return 'translate(' + (width*1.05) + ',' + (vert+200) + ')';
                    });
                legend.append('rect')
                    .attr('width', legendRectSize)
                    .attr('height', legendRectSize)
                    .style('fill', color)
                    .style('stroke', color);

                legend.append('text')
                    .attr('x', legendRectSize + legendSpacing)
                    .attr('y', legendRectSize - legendSpacing)
                    .text(function(d) {
                        return d[0].toUpperCase() + d.slice(1);
                    });

                //End Legend


            };
        }
    }
})
'use strict';

app.controller('MainCtrl', function($scope, data, populate) {
    //Init
    var namesInTable=[]; //for checking duplicate additions
    populate.query(function(res, err) {
        data.setData(res);
        $scope.allData = data.getData();
        $scope.allData.$promise.then(function(res) {
            $scope.packageData = res.slice(0, 3);
            $scope.packageData.forEach(function(el){
                namesInTable.push(el.name);
            })
        });
    });

    $scope.today = new Date(); //Leaving on scope for sorting, for now
    $scope.todayString = $scope.today.toISOString().slice(0, 10); //on scope for display

    $scope.startDate = new Date('2015-01-01');
    $scope.startDateString = $scope.startDate.toISOString().slice(0, 10);
    
    $scope.getData = function() {
        data.resource.query({
            //need query for isArray = true
            name: $scope.packageName,
            startDate: $scope.startDateString,
            endDate: $scope.todayString
        }, function(res, err) {
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
        var packageToAdd = $scope.allData.filter(function(el) {
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
    }
});


app.filter('upcase', function() {
    return function(input) {
        if (!input) return;
        return input[0].toUpperCase() + input.slice(1);
    }
});
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
'use strict';

app.directive('summaryTable', function(data) {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryTable.html',
        // scope: {
        //     summaryData: '=',
        //     startDate: '=',
        //     endDate: '=',
        //     removePackage: '&',
        //     lineHighlight: '&'
        // },
        link: function(scope, element, attrs) {
            scope.rowHandler = function(e) {
                var thisPackage = this.data.name;
                //if they clicked the remove button, remove
                if (e.target.className.split(' ').indexOf('remove') !== -1) {
                    //classList was erroring, doesn't have indexOf method apparently
                    scope.removePackage(thisPackage)
                } else {
                    scope.lineHighlight(thisPackage)
                }
            }
        }
    }
})
