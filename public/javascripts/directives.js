'use strict';

app.directive('summaryTable', function(data) {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryTable.html',
        scope: {
            summaryData: '='
        },
        link: function(scope, element, attrs) {
            scope.rowHandler = function(){
                //if they clicked the remove button, remove

                var thisPackage = this.data.name;
                console.log(this.data.name,thisPackage)
                d3.selectAll('.line').style('stroke-width','2px');
                d3.select('.'+thisPackage)  //select returns first in DOM traversal order
                    .transition()
                    .duration(1000)
                    .ease('bounce')
                    .style('stroke-width','8px');
                
            }
        }
    }
})

.directive('summaryChart', function(data) {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryChart.html',
        scope: {
            summaryData: '=' //,
                // startDate: '=',
                // endDate: '='

                //Probably need to pass in width from scope also
                //dates should probably be independent of the data returned
                //axes should be built off of the request, fill in data after
        },
        link: function(scope,element,attrs) {
            scope.summaryData = data.getData();

            scope.$watch('summaryData',function(){
                //handles initial build, figure out why this doesn't re-render
                //on data change
                scope.buildChart()
            })

            scope.$on('update', function() {
                scope.buildChart();
            });

            
            scope.buildChart = function() {
                // console.log('buildchart fired')
                d3.select('svg').remove(); //for re-rendering

                var data = scope.summaryData;
                var color = d3.scale.category10();

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
                    width = 1000, //- margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                // var parseDate = d3.time.format("%Y-%m-%d"); //.parse

                var x = d3.time.scale()
                    .range([0, width]);
                //Need to adjust both ranges TODO

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
                    d.downloads.forEach(function(e) {
                        e.date = new Date(e.date);
                    })
                });


                x.domain(d3.extent(dateRange, function(d) {
                    return new Date(d);
                }));

                // var downloadMax = d3.max(data, function(d) {
                //     return d.downloads;
                // })
                // var downloadMin = d3.min(data, function(d) {
                //     return d.downloads;
                // })

                //writing my own min/max to index in
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
                y.domain([downloadMin * .75, downloadMax * 1.1]);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    // .attr("transform", "rotate(-90)")
                    .attr("y", -20) //"Downloads" offset from vertical
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
                    .attr('class', function(d){return d.name+' line'})
                    // .attr('class',function(d){return d.name})
                    .attr('d', function(d) {
                        return line(d.downloads);
                    })
                    .style("stroke", function(d) {
                        return color(d.name);
                    });

                    //Building Legend

                    var legendRectSize = 18,
                        legendSpacing = 4;

                    var legend = svg.selectAll('.legend')
                        .data(color.domain())
                        .enter()
                        .append('g')
                        .attr('class','legend')
                        .attr('transform',function(d,i){
                            var height = legendRectSize + legendSpacing;
                            var offset = height * color.domain().length / 2;
                            // var horz = -2 * legendRectSize;
                            var vert = i * height - offset;
                            return 'translate(' + (width*.85) + ','+(vert+75)+')';
                        });
                    legend.append('rect')
                        .attr('width',legendRectSize)
                        .attr('height',legendRectSize)
                        .style('fill',color)
                        .style('stroke',color);
                        
                    legend.append('text')
                            .attr('x',legendRectSize+legendSpacing)
                            .attr('y',legendRectSize-legendSpacing)
                            .text(function(d){console.log(d);return d});

                    //End Legend


            };
        }
    }
})