/** 
 * dependencies 
 */
const cards = require("./cards.js");
const helpers = require("./helpers.js");
const numeral = require("numeraljs");

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
const YEARS = d3.range(1985, 2017);

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
	    // var detached = d3.select(this).append("div")

	    var detached = d3.select(this);

	    var card_header = detached.append("div").classed("crime-card-header", true);
	    var card_body = detached.append("div").classed("crime-card-body", true);
	    
	    var card_title = card_header.append("h3")

	    var expander = card_title.append("span")
		.classed("expander", true)
		.html('<i class="fa fa-bar-chart" aria-hidden="true"></i>')
		.on("click", function(){
		    var body = d3.select(this.parentNode.parentNode.parentNode).select(".crime-card-body");
		    if(body.style("display") == "none"){
			body.style("display",null);
		    }
		    else {
			body.style("display","none");
		    }

					 
		});

	    card_title.append("span").text(city);

	    
	    var city_data = data.filter(function(a){ 
	    	return a[CITY_COL] == city;
	    });

	    // var crimes = city_data.map(function(a){
	    // 	return a[CRIME_COL];
	    // });

	    var chart_area = card_body.append("div")
		.classed("card-area", true);


	    var chart_imgs = chart_area.selectAll(".chart")
		.data(city_data)
		.enter()
		.append("div")
		.classed("crime-area", true)
	    

	    chart_imgs.append("h5").text(function(d){
		return d[CRIME_COL].replace("-"," "); // + ", " +  d[CITY_COL];
	    })
	    
	    chart_imgs.append("img")
		.classed("chart", true)
	    // .on("focus", function(d){ // FAILED QUICK ATTEMPT AT LAZY LOADING	    
		//     d3.select(this).attr("src",
		// 			 d[CITY_COL] + "-"
		// 			 + d[CRIME_COL] + ".png");
		// })
		.attr("src",function(d){
		    return "img/" + d[CITY_COL] + "-" + d[CRIME_COL] + ".png";
		})

	    card_body.append("div").classed("clear-both",true)
	    var footnote = card_body.append("div").classed("footnote", true)

	    footnote.html("Sources: FBI Crime in the United States reports for 2006-2016 data; UCR Data Tool for 1985-2014. Where data did not match in both records for overlapping years, it was left out; <a href='https://github.com/jakekara/CT-UCR-data-transformation/blob/master/output/historical-all.csv'>Full data</a> and data transformation code available in <a href='https://github.com/jakekara/CT-UCR-data-transformation'>this github repo</a>.");

	    // var crime_table = card_body.append("table")
	    // 	.classed("crime-table", true);

	    // var thead = crime_table.append("thead");
	    // var tbody = crime_table.append("tbody");

	    // thead.selectAll("th")
	    // 	.data([""].concat(YEARS))
	    // 	.enter()
	    // 	.append("th")
	    // 	.text(function(d){ return d; });

	    // var rows = tbody.selectAll("tr")
	    // 	.data(city_data)
	    // 	.enter()
	    // 	.append("tr")

	    // rows.append("th")
	    // 	.text(function(d){ return d[CRIME_COL]; });

	    // rows.each(function(d){
	    // 	for (var i in YEARS){
	    // 	    year = YEARS[i];

	    // 	    d3.select(this).append("td")
	    // 		.text(function(){

	    // 		    if (d[year + "_diff_pct"] > 0
	    // 			&& d[year + "_diff_pct"] < 0.01) {
	    // 			return "["
	    // 			    + numeral(d[year + "_new"]).format("0,0")
	    // 			    + "]";
	    // 		    }
			    
	    // 		    if (d[year] == "") return "--"
	    // 		    // if (isNaN(d[year])) return "--"
	    // 		    // console.log(d[year],
	    // 		    // 		isNaN(d[year]),
	    // 		    // 		typeof(d[year]) == "undefined", d);
	    // 		    return numeral(d[year]).format("0,0");
	    // 		});
	    // 	}
	    // });

	    // var crime_areas = card_body.selectAll("crime-area")
	    // 	.data(city_data)
	    // 	.enter()
	    // 	.append("div")
	    // 	.classed("crime-area", true);

	    // crime_areas.append("h5")
	    // 	.text(function(a){ return a[CRIME_COL]; });

	    // var crime_charts = crime_areas.append("div")
	    // 	.classed("crime-chart", true);

	    // crime_charts
	    // 	.each(function(d){
	    // 	    var chart_data = [];

	    // 	    for (y in YEARS){
	    // 		var year = YEARS[y];
	    // 		var obj = {
	    // 		    "year":year,
	    // 		    "val":d[year]
	    // 		}
	    // 		chart_data.push(obj);
	    // 	    }

	    // 	    helpers.barChart(d3.select(this), chart_data,"year","val");
	    // 	});

	    // crime_areas.append("div")
	    // 	.classed("clear-both", true);

	    // return detached.html();
	});
}

d3.csv(DATA_URL, go_with_data);


