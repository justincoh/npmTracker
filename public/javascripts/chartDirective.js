app.directive('summaryChart', function(data) {
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryChart.html',
        link: function(scope, element, attrs) {
            scope.$watch('packageData.length', function() {
                if (typeof scope.packageData !== 'undefined' && typeof scope.packageData[0] !== 'undefined') {
                    scope.buildChart();
                }
            });

            scope.buildChart = function() {

                var startTime = scope.startDate;
                var endTime = scope.today;

                var data = scope.packageData;
                var color = d3.scale.category10();

                var margin = {
                        top: 20,
                        right: 20,
                        bottom: 30,
                        left: 90
                    },
                    //set width/height off viewport dimensions TODO
                    width = 1000 - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                var x = d3.time.scale()
                    .domain([startTime, endTime])
                    .range([0, width]);

                var y = d3.scale.linear()
                    .range([height, 0]);

                var line = d3.svg.line()
                    // .interpolate('cardinal') 
                    .x(function(d) {
                        if (x(d.date) <= 0) {
                            return null;
                        }
                        return x(d.date)

                    })
                    .y(function(d) {
                        return y(d.downloads);
                    });

                var zoom = d3.behavior.zoom()
                    .x(x)
                    .scaleExtent([1, 10])
                    .on('zoom', draw);

                var svg = d3.select("#chart-container").append("svg")
                    // .attr("width", width + margin.left + margin.right)
                    .attr('width', '100%')
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .call(zoom)

                //has to be here for zooming
                svg.append("rect")
                    .attr('class', 'background')
                    .attr("width", width)
                    .attr("height", height)
                    .style('opacity', 0);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom');

                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', "translate(0," + y(0) + ")")
                    .call(xAxis)

                // var yAxis = d3.svg.axis()
                //     .scale(y)
                //     .orient("left");

                //converting to actual dates
                data.forEach(function(d) {
                    d.downloads.forEach(function(e) {
                        e.date = new Date(e.date);
                    })
                });

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

                // svg.append("g")
                //     .attr("class", "x axis")
                //     .attr("transform", "translate(-5," + height + ")")
                //     .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(d3.svg.axis().scale(y).orient('left'))
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -85)
                    .attr('x', -175)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Downloads");


                var npmPackage = svg.selectAll('npmPackage')
                    .data(data)
                    .enter().append('g')
                    .attr('class', 'npmPackage')
                    .attr('width', width)


                npmPackage.append('path')
                    .datum(function(d) {
                        return d;
                    })
                    .attr('class', function(d) {
                        return d.name + ' line'
                    })

                .style('stroke', function(d) {
                        return color(d.name);
                    })
                    .style('stroke-linecap', 'round')
                    .style('stroke-linejoin', 'bevel');

                var tooltip = d3.select('#tooltip');

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
                        return 'translate(' + (width * 1.05) + ',' + (vert + 200) + ')';
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

                // console.log('DATA ',data)
                // //datapoint dots
                // svg.selectAll("dot")
                //     .data(data)
                //     .enter().append("circle")
                //     .attr("r", 5)
                //     .attr("cx", function(d) {
                //         console.log('circleD ',d)
                //         return x(d.downloads);
                //     })
                //     .attr("cy", function(d) {
                //         return y(d.downloads);
                //     })

                draw();

                function draw() {
                    // if blocks handle zoom/pan limits
                    if (x.domain()[0] < startTime) {
                        var k = zoom.translate()[0] - x(startTime) + x.range()[0];
                        zoom.translate([k, 0]);
                    } else if (x.domain()[1] > endTime) {
                        var k = zoom.translate()[0] - x(endTime) + x.range()[1];
                        zoom.translate([k, 0]);
                    }

                    svg.selectAll("path.line").attr("d", function(d) {
                        return line(d.downloads)
                    })
                    svg.select("g.x.axis").call(xAxis);




                }


            };
        }
    }
})