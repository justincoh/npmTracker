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

                var startTime = new Date('2015-01-01');
                var endTime = new Date();


                var x = d3.time.scale()
                    .domain([startTime, endTime])
                    .range([0, width]);

                var y = d3.scale.linear()
                    .domain([0, 100000])
                    .range([height, 0]);

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
                    .attr("width", width + margin.left + margin.right)
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
                    .attr("width", width)
                    .attr("height", height);


                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                svg.append('g')
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + y(0) + ")")
                    .call(xAxis);


                svg.append("g")
                    .attr("class", "y axis")
                    .call(d3.svg.axis().scale(y).orient("left"))
                    .append('text')
                    .text('Downloads')
                    .style('font-size', '16px')
                    .attr('x', 5)
                    .attr('y', 0);

                //this is where i append path, how to append multiples
                var packages = svg.selectAll('.npmPackage')
                    .data(data)
                    .enter()
                    .append('g')
                    .attr('class', function(d) {
                        return d.name
                    });

                packages.append('path')
                    .attr('class', 'line')
                    .attr('clip-path', function(d) {
                        return 'url(#clip)'
                    })
                    .attr('d', function(d) {
                        return line(d.downloads)
                    })
                    .style('stroke', function(d) {
                        return color(d.name)
                    })


                function draw() {
                    //if blocks handle zoom/pan limits
                    if (x.domain()[0] < startTime) {
                        var k = zoom.translate()[0] - x(startTime) + x.range()[0];
                        zoom.translate([k, 0]);
                    } else if (x.domain()[1] > endTime) {
                        var k = zoom.translate()[0] - x(endTime) + x.range()[1];
                        zoom.translate([k, 0]);
                    }

                    svg.select("g.x.axis").call(xAxis);
                    svg.select("path.line").attr("d", function(d) {
                        return line(d.downloads)
                    });

                }

                draw();

            }





        }
    }
})