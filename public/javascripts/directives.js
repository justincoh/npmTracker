'use strict';

app.directive('summaryTable', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryTable.html',
        scope: {
            summaryData: '='
        },
        link: function(scope, element, attrs) {}
    }
})

.directive('summaryChart', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryChart.html',
        scope: {
            summaryData: '='//,
            // startDate: '=',
            // endDate: '='
        },
        link: function(scope, element, attrs) {
            scope.buildChart = function() {

                var data = scope.summaryData;
                var color = d3.scale.category10();


                //dates should probably be independent of the data returned
                //axes should be built off of the request, fill in data after

                var dateRange = [];
                scope.summaryData[0].downloads.forEach(function(el) {
                    //HARDCODED to expect syncd dates
                    //Adjust this to use scope variables instead
                    dateRange.push(el.date)
                });
                var margin = {
                        top: 20,
                        right: 20,
                        bottom: 30,
                        left: 75
                    },
                    width = 960 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                var parseDate = d3.time.format("%Y-%m-%d"); //.parse

                var x = d3.time.scale()
                    .range([0, width])

                var y = d3.scale.linear()
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .ticks(d3.time.day, 1)
                    .tickFormat(d3.time.format("%Y-%m-%d"));

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

                // var area = d3.svg.area()
                //     .x(function(d) {
                //         return x(d.date);
                //     })
                //     .y0(height)
                //     .y1(function(d) {
                //         return y(d.downloads);
                //     });

                var line = d3.svg.line()
                    .x(function(d) {
                        return x(d.date);
                    })
                    .y(function(d) {
                        return y(d.downloads);
                    });

                var svg = d3.select("#chart-container").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                data.forEach(function(d) {
                    d.downloads.forEach(function(e){
                        e.date = new Date(e.date)
                    })
                });

                // x.domain(d3.extent(data, function(d) {
                //     return d.date;
                // }));

                x.domain(d3.extent(dateRange, function(d) {
                    //THIS RELIES ON SYNCd DATA
                    return new Date(d);
                }));

                // var downloadMax = d3.max(data, function(d) {
                //     return d.downloads;
                // })
                // var downloadMin = d3.min(data, function(d) {
                //     return d.downloads;
                // })

                //writing my own min/max
                var getMax = function(arr) {
                    var max = 0;
                    arr.forEach(function(npmPackage) {
                        npmPackage.downloads.forEach(function(day){
                            if(day.downloads > max){
                                max=day.downloads;
                            }
                        })
                    })
                    return max;
                }

                var downloadMax = getMax(data);
                var getMin = function(arr) {
                    var min = downloadMax;
                    arr.forEach(function(npmPackage) {
                        npmPackage.downloads.forEach(function(day){
                            if(day.downloads < min){
                                min=day.downloads;
                            }
                        })
                    })
                    return min;
                }
                var downloadMin = getMin(data);
                y.domain([0, downloadMax * 1.2]);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Downloads");


                var npmPackage = svg.selectAll('npmPackage')
                    .data(data)
                    .enter().append('g')
                    .attr('class','npmPackage');
            
                npmPackage.append('path')
                    .datum(function(d){return d})
                    .attr('class','line')
                    .attr('d',function(d){return line(d.downloads)})
                    .style("stroke", function(d) { return color(d.name)});
            }
        }
    }
})