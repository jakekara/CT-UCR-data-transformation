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

var go_with_data = function(data){

    // extract city names
    var cities = data.map(function(a){ return a[CITY_COL]; });
    // console.log(cities);

    // get unique list
    cities = helpers.uniqueArray(cities)
    // console.log(helpers.uniqueArray(cities));

    // generate index cards
    var crime_db = new cards.cards()
	.data(cities)
	.container(d3.select("#container"))
	.draw(function(city){

	    // create detached div to draw index card contents
	    // var detached = d3.select(document.createElement("div"));
	    var detached = d3.select(this).append("div")

	    // var detached = d3.select(this);

	    var card_header = detached.append("div").classed("crime-card-header", true);
	    var card_body = detached.append("div").classed("crime-card-body", true);
	    
	    var card_title = card_header.append("h3").text(city);
	    
	    var city_data = data.filter(function(a){ 
	    	return a[CITY_COL] == city;
	    });

	    var crimes = city_data.map(function(a){
		return a[CRIME_COL];
	    });

	    var crime_areas = card_body.selectAll("crime-area")
		.data(city_data)
		.enter()
		.append("div")
		.classed("crime-area", true);

	    crime_areas.append("h5")
		.text(function(a){ return a[CRIME_COL]; });

	    var crime_charts = crime_areas.append("div")
		.classed("crime-chart", true);

	    crime_charts
		.each(function(d){
		    var chart_data = [];

		    for (y in YEARS){
			var year = YEARS[y];
			var obj = {
			    "year":year,
			    "val":d[year]
			}
			chart_data.push(obj);
		    }

		    helpers.barChart(d3.select(this), chart_data,"year","val");
		})
		
	    
	    return detached.html();
	});
}

d3.csv(DATA_URL, go_with_data);


