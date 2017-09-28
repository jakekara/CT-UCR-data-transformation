(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// const d3 = require("d3");

var cards = function () {
			return this;
};

exports.cards = cards;

cards.prototype.data = function (d) {
			if (typeof d == "undefined") return this.__data;
			this.__data = d;
			return this;
};

cards.prototype.container = function (c) {
			if (typeof c == "undefined") return this.__container;
			this.__container = c;
			return this;
};

cards.prototype.draw_func = function (f) {
			if (typeof f == "undefined") return this.__draw_func;
			this.__draw_func = f;
			return this;
};

cards.prototype.draw = function (f) {

			this.container().html("");

			var search_area = this.container().append("div").classed("card-search", true);

			var search_input = search_area.append("input").attr("placeholder", "Type district name to search...").classed("search-bar", true).attr("type", "text");

			var card_box = this.container().append("div").classed("card-box", true);

			var cards = card_box.selectAll(".card").data(this.data()).enter().append("div").classed("card", true).each(f);

			var that = this;

			cards.select(".card-body").style("display", "none");

			cards.on("click", function () {

						var displaying = d3.select(this).select(".card-body").style("display");

						d3.selectAll(".card-body").style("display", "none");

						if (displaying == "none") {
									d3.select(this).select(".card-body").style("display", null);
						}

						if (displaying == null) {
									d3.select(this).select(".card-body").style("display", "none");
						}
			});

			var search = function (t) {
						d3.selectAll(".card").style("display", "none");

						if (t.trim().length <= 0) {
									d3.selectAll(".card").style("display", null);
									return;
						}

						d3.selectAll(".card").each(function () {
									if (d3.select(this).text().toUpperCase().indexOf(t.toUpperCase()) >= 0) d3.select(this).style("display", null);
						});
			};

			search_input.on("input", function () {
						search(this.value);
			});

			// // search_input.node().value = "Hartford";

			// search("Hartford");


			return this;
};

},{}],2:[function(require,module,exports){
/** 
 * dependencies 
 */
const cards = require("./cards.js");
const helpers = require("./helpers.js");

// no longer bundling d3, since I can't resolve this new bundling problem
// in a reasonable amount of time. Commenting out below
// issue link: https://github.com/d3/d3-request/issues/24
// const d3 = require("d3");

/** 
 * config stuff 
 */
const DATA_URL = "data/historical-all.csv";
const CITY_COL = "City";
const CRIME_COL = "crime";
const YEARS = d3.range(2006, 2017);

var go_with_data = function (data) {

	// extract city names
	var cities = data.map(function (a) {
		return a[CITY_COL];
	});
	// console.log(cities);

	// get unique list
	cities = helpers.uniqueArray(cities);
	// console.log(helpers.uniqueArray(cities));

	// generate index cards
	var crime_db = new cards.cards().data(cities).container(d3.select("#container")).draw(function (city) {

		// create detached div to draw index card contents
		// var detached = d3.select(document.createElement("div"));
		var detached = d3.select(this).append("div");

		// var detached = d3.select(this);

		var card_header = detached.append("div").classed("crime-card-header", true);
		var card_body = detached.append("div").classed("crime-card-body", true);

		var card_title = card_header.append("h3").text(city);

		var city_data = data.filter(function (a) {
			return a[CITY_COL] == city;
		});

		var crimes = city_data.map(function (a) {
			return a[CRIME_COL];
		});

		var crime_areas = card_body.selectAll("crime-area").data(city_data).enter().append("div").classed("crime-area", true);

		crime_areas.append("h5").text(function (a) {
			return a[CRIME_COL];
		});

		var crime_charts = crime_areas.append("div").classed("crime-chart", true);

		crime_charts.each(function (d) {
			var chart_data = [];

			for (y in YEARS) {
				var year = YEARS[y];
				var obj = {
					"year": year,
					"val": d[year]
				};
				chart_data.push(obj);
			}

			helpers.barChart(d3.select(this), chart_data, "year", "val");
		});

		return detached.html();
	});
};

d3.csv(DATA_URL, go_with_data);

},{"./cards.js":1,"./helpers.js":3}],3:[function(require,module,exports){
/**
 * helpers.js
 */

/**
 * uniqueArray - return a unique array 
 */
var uniqueArray = function (arr, eq) {

    var eq = eq || function (a, b) {
        return a == b;
    };

    var ret = [];

    for (var i = 0; i < arr.length; i++) {
        if (ret.indexOf(arr[i]) >= 0) continue;
        ret.push(arr[i]);
    }

    return ret;
};

exports.uniqueArray = uniqueArray;

var barChart = function (container, data, xCol, yCol) {

    // var detached = d3.select(document.createElement("div"));
    // var detached = d3.select(this);
    var detached = container;
    console.log(container);

    var xs = function () {
        return data.map(function (d) {
            return d[xCol];
        });
    }();

    var ys = function () {
        return data.map(function (d) {
            return d[yCol];
        });
    };

    var svg = detached.append("svg").style("width", "100%");
    var height = 200,
        width = 200;
    const margin = 20;

    svg.style("height", height + "px");
    svg.style("width", width + "px");

    var xScale = d3.scaleBand().domain(data.map(function (d) {
        return d[xCol];
    })).range([margin, width - margin]);
    var yScale = d3.scaleLinear().domain([0, d3.max(data.map(function (d) {
        return d[yCol];
    }))]).range([height - margin, margin]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    var xAxisDiv = svg.append("g").attr("transform", "translate(0," + function () {
        console.log("this", this);
        return height - margin;
    }() + ")").call(xAxis);

    svg.append("g").attr("class", "y axis").attr("transform", "translate(" + margin + "," + 0 + ")").call(yAxis);

    var valueline = d3.line().x(function (d) {
        return xScale(d[xCol]);
    }).y(function (d) {
        return yScale(d[yCol]);
    });

    console.log(data);

    svg.append("g").append("path").data([data])
    // // .data([{x:1,y:10},{x:2,y:20},{x:3,y:30}])
    // // .attr("class", "line")
    .attr("d", valueline);
    // // return detached.html();
};

exports.barChart = barChart;

},{}]},{},[2]);
