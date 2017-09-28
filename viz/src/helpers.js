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
    	width = 200;
    const margin = 20;
    
    svg.style("height", height + "px");
    svg.style("width", width + "px");

    var xScale = d3.scaleBand()
	.domain(data.map(function(d){ return d[xCol]; }))
	.range([margin, width - margin]);
    var yScale = d3.scaleLinear()
	.domain([0,d3.max(data.map(function(d) { return d[yCol]; }))])
	.range([height - margin, margin]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    var xAxisDiv = svg.append("g")
        .attr("transform", "translate(0," + function(){
	    return height - margin;
	}() + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin + "," + 0 + ")")
        .call(yAxis);

    var valueline = d3.line()
        .x(function(d){ return xScale(d[xCol]); })
        .y(function(d){ return yScale(d[yCol]); })


    svg.append("g").append("path")
    	.data([data])
        .attr("class", "line")
        .attr("d", valueline);
    // // return detached.html();
        
}

exports.barChart = barChart;
