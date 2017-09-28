// const d3 = require("d3");

var cards = function()
{
    return this;
    
}

exports.cards = cards;

cards.prototype.data = function(d){
    if (typeof(d) == "undefined") return this.__data;
    this.__data = d;
    return this;
}

cards.prototype.container = function(c){
    if (typeof(c) == "undefined") return this.__container;
    this.__container = c;
    return this;
}

cards.prototype.draw_func = function(f){
    if (typeof(f) == "undefined") return this.__draw_func;
    this.__draw_func = f;
    return this;
}

cards.prototype.draw = function(f){

    this.container().html("");

    var search_area = this.container().append("div")
	.classed("card-search", true);

    var search_input = search_area.append("input")
	.attr("placeholder","Type district name to search...")
	.classed("search-bar", true)
	.attr("type","text");

    var card_box = this.container().append("div")
	.classed("card-box", true)
    
    var cards = card_box.selectAll(".card")
	.data(this.data())
	.enter()
	.append("div")
	.classed("card", true)
	.each(f);

    var that = this;

    cards.select(".card-body").style("display","none");

    cards.on("click", function(){

	var displaying = d3.select(this).select(".card-body").style("display");


	d3.selectAll(".card-body").style("display","none");

	if (displaying == "none")
	{
	    d3.select(this).select(".card-body").style("display", null);
	}

	if (displaying == null)
	{
	    d3.select(this).select(".card-body").style("display", "none");
	}
	
    });

    var search = function(t){
	d3.selectAll(".card").style("display","none");

	if (t.trim().length <= 0) {
	    d3.selectAll(".card").style("display",null);	    
	    return;
	}
	
	d3.selectAll(".card").each(function(){
	    if (d3.select(this).text().toUpperCase().indexOf(t.toUpperCase()) >= 0)
		d3.select(this).style("display",null);
	});
    }

    search_input.on("input", function(){
	search(this.value);
    });

    // // search_input.node().value = "Hartford";

    // search("Hartford");
    

    return this;
    
}


