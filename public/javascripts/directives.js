'use strict';

app.directive('summaryTable', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryTable.html',
        scope: {
            summaryData: '='
        },
        link: function(scope, element, attrs) {
            scope.d3Test = function() {
                var table = d3.select('table');
                var color = "red";
                if (table.style('background-color') === 'rgb(255, 0, 0)') {
                    color = 'white';
                }
                table.transition().duration(1000).ease('bounce').style('background-color', color);
            }
        }
    }
})

.directive('summaryChart', function() {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryChart.html',
        scope: {
            summaryData: '='
        },
        link: function(scope, element, attrs) {
            //Need graph to generate only once data is present
            // if (typeof summaryData !== 'undefined') {
                scope.buildChart = function(data) {
                    var margin = {
                            top: 20,
                            right: 20,
                            bottom: 30,
                            left: 75
                        },
                        width = 960 - margin.left - margin.right,
                        height = 500 - margin.top - margin.bottom;

                    var parseDate = d3.time.format("%Y-%m-%d"); //.parse;

                    var x = d3.time.scale()
                        .range([0, width]);

                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    var line = d3.svg.line()
                        .x(function(d) {
                        	console.log('x(d ',x(d.date), x)
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

                    // d3.tsv("data.tsv", function(error, data) {

                    var data = scope.summaryData.downloads
                    data.forEach(function(d) {
                        d.date = new Date(d.date);
                        // console.log('after ',d.date)
                    });

                    x.domain(d3.extent(data, function(d) {
                        return d.date;
                    }));
                    y.domain(d3.extent(data, function(d) {
                        return d.downloads;
                    }));

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

                    svg.append("path")
                        .datum(data)
                        .attr("class", "line")
                        .attr("d", line);
                    // });
                }
            // }
        }
    }
})