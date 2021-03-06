app.directive('summaryChart', function(data) {
    //this REALLY needs to be componentized and rebuilt ...
    return {
        restrict: 'E',
        templateUrl: 'templates/summaryChart.html',
        link: function(scope, element, attrs) {
            scope.$watch('packageData.length', function() {
                if (typeof scope.packageData !== 'undefined' && typeof scope.packageData[0] !== 'undefined') {
                    scope.buildChart();
                    d3.select('.spinner').style('display','none');
                }
            });

            scope.buildChart = function() {

                d3.select('svg').remove();
                var data = scope.packageData;
                var color = d3.scale.category10();

                var margin = {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 90
                };
                //set width/height off viewport dimensions TODO
                var width = 1000 - margin.left - margin.right;
                var height = 500 - margin.top - margin.bottom;

                var startTime = new Date('2015-06-01');
                var endTime = new Date();


                var x = d3.time.scale()
                    .domain([startTime, endTime])
                    .range([0, width]);

                var y = d3.scale.linear()
                    .range([height, 0]);

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

                var line = d3.svg.line()
                    .x(function(d) {

                        return x(d.date)
                    })
                    .y(function(d) {
                        return y(d.downloads)
                    });

                var zoom = d3.behavior.zoom()
                    .x(x)
                    //.y(y)
                    .scaleExtent([1, 10])
                    .on('zoom', draw);

                var svg = d3.select('#chart-container').append('svg')
                    // .attr("width", width + margin.left + margin.right)
                    .attr("width", '100%')
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                    .call(zoom);

                svg.append("rect") //has to be here for zooming
                    .attr('class', 'background')
                    .attr("width", width)
                    .attr("height", height)
                    .style('opacity', 0);

                //Clips the download lines at the Y axis
                svg.append("defs").append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("width", width * 2)
                    .attr("height", height);


                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                svg.append('g')
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + (height) + ")")
                    .attr('width', '100%')
                    .call(xAxis);


                svg.append("g")
                    .attr("class", "y axis")
                    .call(d3.svg.axis().scale(y).orient("left"))
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", -85)
                    .attr('x', -175)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Downloads");



                //this is where i append path, how to append multiples
                svg.selectAll('.npmPackage')
                    .data(data)
                    .enter()
                    .append('g')
                    .attr('class', function(d) {
                        return d.name + ' package'
                    });



                var packages = svg.selectAll('.package')
                    //     .append('circle')

                packages.append('path')
                    .attr('class', function(d) {
                        return d.name + ' line'
                    })
                    .attr('clip-path', function(d) {
                        return 'url(#clip)'
                    })
                    .attr('d', function(d) {
                        return line(d.downloads)
                    })
                    .style('stroke', function(d) {
                        return color(d.name)
                    });

                packages.each(function(parentData) {
                    // console.log('parentdata ',parentData)
                    var thisPackage = d3.select(this)
                        // console.log('this ', thisPackage)
                    thisPackage.selectAll('.datapoints')
                        .data(parentData.downloads)
                        .enter()
                        .append('circle')
                        .attr('class', function(d){
                            return parentData.name + ' datapoints'
                        })
                        .attr('cx', function(d) {
                            return x(d.date)
                        })
                        .attr('cy', function(d) {
                            return y(d.downloads)
                        })
                        .attr('r', '3px')
                        .attr('fill', function(d) {
                            return color(parentData.name)
                        })
                        .on('mouseover', function(d) {
                            buildTooltip.call(this);
                        })
                        .on('mousemove', function() {
                            buildTooltip.call(this);
                        })
                        .on('mouseout', function() {
                            tooltip
                                .transition()
                                .duration(500)
                                .style('opacity',0)
                                .each('end',removeTooltip) //fixes a hover bug
                        });
                })

                var tooltip = d3.select('#tooltip')

                function buildTooltip() {
                    var scaleData = d3.select(this)
                    var packageName = this.classList[0];
                    var displayName = packageName.slice(0, 1).toUpperCase() + packageName.slice(1);
                    var date = x.invert(scaleData.attr('cx')).toLocaleDateString()
                    var downloads = y.invert(scaleData.attr('cy')).toFixed(0);
                    var downloads= downloads.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
                    var template = displayName + '<br>' + date + '<br>' + downloads + ' Downloads';
                    tooltip
                        .style('left', (d3.event.pageX - 40) + 'px')
                        .style('top', (d3.event.pageY - 75) + 'px')
                    tooltip.html([template]);
                    tooltip.style('opacity', 1)
                        .style('background', function(d) {
                            return color(packageName)
                        })
                };

                var removeTooltip = function(){
                    d3.select(this)
                        .style('left',0+'px')
                        .style('top',0+'px')
                }

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


                function draw() {
                    //if blocks handle zoom/pan limits
                    var domain = x.domain();
                    domain = domain[1]-domain[0]; //date difference to handle dot sizing
                    var msPerDay = 86400000;
                    var diff = domain/msPerDay;
                    if (x.domain()[0] < startTime) {
                        var k = zoom.translate()[0] - x(startTime) + x.range()[0];
                        zoom.translate([k, 0]);
                    } else if (x.domain()[1] > endTime) {
                        var k = zoom.translate()[0] - x(endTime) + x.range()[1];
                        zoom.translate([k, 0]);
                    }

                    svg.select("g.x.axis").call(xAxis);
                    svg.selectAll("path.line")
                        .attr("d", function(d) {
                        return line(d.downloads)
                    });
                    svg.selectAll('.datapoints')
                        .attr('cx',function(d){
                            return x(d.date)
                        })
                        .attr('cy',function(d){
                            return y(d.downloads)
                        })
                        .style('opacity',function(d){
                            if(x(d.date)<=0){   //faking the clip
                                return 0;
                            }
                        })
                        .transition()
                        .attr('r',function(d){
                            if(diff>75){
                                return '3px'
                            } else if(diff>40){
                                return '4px'
                            } else if(diff>20){
                                return '5px'
                            } else {return '7px'}
                        })

                }

                draw();

            }





        }
    }
})