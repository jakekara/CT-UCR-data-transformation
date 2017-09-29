/**
 * helpers.js
 */

/**
 * uniqueArray - return a unique array 
 */
var uniqueArray = function(arr, eq){

    var eq = eq || function(a, b){ return a == b };

    var ret = [];

    for (var i = 0; i < arr.length; i++){
	if (ret.indexOf(arr[i]) >= 0 ) continue;
	ret.push(arr[i]);
    }

    return ret;
    
}

exports.uniqueArray = uniqueArray;

var barChart = function(container, data, xCol, yCol) {

    // var detached = d3.select(document.createElement("div"));
    // var detached = d3.select(this);
    var detached = container;

    var xs = function(){
	return data.map(function(d){ return d[xCol]; })
    }();

    var ys = function(){
	return data.map(function(d){ return d[yCol]; })
    }

    var svg = detached.append("svg").style("width", "100%");
    var height = 200,
    	width = 320;
    const margin = 40;
    const smallMargin = 10;
    
    svg.style("height", height + "px");
    svg.style("width", width + "px");

    var xScale = d3.scaleBand()
	.domain(data.map(function(d){ return d[xCol]; }))
	.range([margin, width]);

    var yScale = d3.scaleLinear()
	.domain([smallMargin,d3.max(data.map(function(d) { return d[yCol]; }))])
	.range([height - margin, smallMargin]);

    var xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(d, i){
	return i % 10 == 0;
    }));
    
    var yAxis = d3.axisLeft(yScale).ticks(4)

    var xAxisDiv = svg.append("g")
	.attr("transform","translate(" + 0 + "," + (height - margin) + ")")
        .call(xAxis);

    var yAxisDiv = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin + "," + 0 + ")")
        .call(yAxis);

    // yAxisDiv.attr("transform", function(){
    // 	return "translate(" + d3.select(this).node().getBBox().width + ",0)";
    // });

    // yAxisDiv.attr("transform", function(){
    // 	return "translate(" + margin + ",0)");
    // });


    // var valueline = d3.line()
    //     .x(function(d){ return xScale(d[xCol]); })
    //     .y(function(d){ return yScale(d[yCol]); })

    // svg.append("g").append("path")
    // 	.data([data])
    //     .attr("class", "line")
    //     .attr("d", valueline);
    // // return detached.html();

    var pointArea = svg.append("g")
	.classed("point-layer", true);
    
    var points = pointArea.selectAll(".point")
	.data(data.filter(function(d){ return d[yCol] != ""; }))
	.enter()
	.append("circle")
	// .classed("hidden", function(d){
	//     return d[yCol] == "";
	// })
	.classed("point", true)
	.attr("cx", function(d){ return xScale(d[xCol]); })
	.attr("cy", function(d){ return yScale(d[yCol]); })
	.attr("r", 2)

    pointArea.attr("transform","translate(" + margin + "," + 0 + ")");
    
        
}

exports.barChart = barChart;
