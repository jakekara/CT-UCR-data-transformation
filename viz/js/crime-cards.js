(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * numeral.js
 * version : 1.5.6
 * author : Adam Draper
 * license : MIT
 * http://adamwdraper.github.com/Numeral-js/
 */

(function () {

    /************************************
        Constants
    ************************************/

    var numeral,
        VERSION = '1.5.6',
        // internal storage for language config files
        languages = {},
        currentLanguage = 'en',
        zeroFormat = null,
        defaultFormat = '0,0',
        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports);


    /************************************
        Constructors
    ************************************/


    // Numeral prototype object
    function Numeral (number) {
        this._value = number;
    }

    /**
     * Implementation of toFixed() that treats floats more like decimals
     *
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
     * problems for accounting- and finance-related software.
     */
    function toFixed (value, precision, roundingFunction, optionals) {
        var power = Math.pow(10, precision),
            optionalsRegExp,
            output;
            
        //roundingFunction = (roundingFunction !== undefined ? roundingFunction : Math.round);
        // Multiply up by precision, round accurately, then divide and use native toFixed():
        output = (roundingFunction(value * power) / power).toFixed(precision);

        if (optionals) {
            optionalsRegExp = new RegExp('0{1,' + optionals + '}$');
            output = output.replace(optionalsRegExp, '');
        }

        return output;
    }

    /************************************
        Formatting
    ************************************/

    // determine what type of formatting we need to do
    function formatNumeral (n, format, roundingFunction) {
        var output;

        // figure out what kind of format we are dealing with
        if (format.indexOf('$') > -1) { // currency!!!!!
            output = formatCurrency(n, format, roundingFunction);
        } else if (format.indexOf('%') > -1) { // percentage
            output = formatPercentage(n, format, roundingFunction);
        } else if (format.indexOf(':') > -1) { // time
            output = formatTime(n, format);
        } else { // plain ol' numbers or bytes
            output = formatNumber(n._value, format, roundingFunction);
        }

        // return string
        return output;
    }

    // revert to number
    function unformatNumeral (n, string) {
        var stringOriginal = string,
            thousandRegExp,
            millionRegExp,
            billionRegExp,
            trillionRegExp,
            suffixes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            bytesMultiplier = false,
            power;

        if (string.indexOf(':') > -1) {
            n._value = unformatTime(string);
        } else {
            if (string === zeroFormat) {
                n._value = 0;
            } else {
                if (languages[currentLanguage].delimiters.decimal !== '.') {
                    string = string.replace(/\./g,'').replace(languages[currentLanguage].delimiters.decimal, '.');
                }

                // see if abbreviations are there so that we can multiply to the correct number
                thousandRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.thousand + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                millionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.million + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                billionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.billion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                trillionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.trillion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');

                // see if bytes are there so that we can multiply to the correct number
                for (power = 0; power <= suffixes.length; power++) {
                    bytesMultiplier = (string.indexOf(suffixes[power]) > -1) ? Math.pow(1024, power + 1) : false;

                    if (bytesMultiplier) {
                        break;
                    }
                }

                // do some math to create our number
                n._value = ((bytesMultiplier) ? bytesMultiplier : 1) * ((stringOriginal.match(thousandRegExp)) ? Math.pow(10, 3) : 1) * ((stringOriginal.match(millionRegExp)) ? Math.pow(10, 6) : 1) * ((stringOriginal.match(billionRegExp)) ? Math.pow(10, 9) : 1) * ((stringOriginal.match(trillionRegExp)) ? Math.pow(10, 12) : 1) * ((string.indexOf('%') > -1) ? 0.01 : 1) * (((string.split('-').length + Math.min(string.split('(').length-1, string.split(')').length-1)) % 2)? 1: -1) * Number(string.replace(/[^0-9\.]+/g, ''));

                // round if we are talking about bytes
                n._value = (bytesMultiplier) ? Math.ceil(n._value) : n._value;
            }
        }
        return n._value;
    }

    function formatCurrency (n, format, roundingFunction) {
        var symbolIndex = format.indexOf('$'),
            openParenIndex = format.indexOf('('),
            minusSignIndex = format.indexOf('-'),
            space = '',
            spliceIndex,
            output;

        // check for space before or after currency
        if (format.indexOf(' $') > -1) {
            space = ' ';
            format = format.replace(' $', '');
        } else if (format.indexOf('$ ') > -1) {
            space = ' ';
            format = format.replace('$ ', '');
        } else {
            format = format.replace('$', '');
        }

        // format the number
        output = formatNumber(n._value, format, roundingFunction);

        // position the symbol
        if (symbolIndex <= 1) {
            if (output.indexOf('(') > -1 || output.indexOf('-') > -1) {
                output = output.split('');
                spliceIndex = 1;
                if (symbolIndex < openParenIndex || symbolIndex < minusSignIndex){
                    // the symbol appears before the "(" or "-"
                    spliceIndex = 0;
                }
                output.splice(spliceIndex, 0, languages[currentLanguage].currency.symbol + space);
                output = output.join('');
            } else {
                output = languages[currentLanguage].currency.symbol + space + output;
            }
        } else {
            if (output.indexOf(')') > -1) {
                output = output.split('');
                output.splice(-1, 0, space + languages[currentLanguage].currency.symbol);
                output = output.join('');
            } else {
                output = output + space + languages[currentLanguage].currency.symbol;
            }
        }

        return output;
    }

    function formatPercentage (n, format, roundingFunction) {
        var space = '',
            output,
            value = n._value * 100;

        // check for space before %
        if (format.indexOf(' %') > -1) {
            space = ' ';
            format = format.replace(' %', '');
        } else {
            format = format.replace('%', '');
        }

        output = formatNumber(value, format, roundingFunction);
        
        if (output.indexOf(')') > -1 ) {
            output = output.split('');
            output.splice(-1, 0, space + '%');
            output = output.join('');
        } else {
            output = output + space + '%';
        }

        return output;
    }

    function formatTime (n) {
        var hours = Math.floor(n._value/60/60),
            minutes = Math.floor((n._value - (hours * 60 * 60))/60),
            seconds = Math.round(n._value - (hours * 60 * 60) - (minutes * 60));
        return hours + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds);
    }

    function unformatTime (string) {
        var timeArray = string.split(':'),
            seconds = 0;
        // turn hours and minutes into seconds and add them all up
        if (timeArray.length === 3) {
            // hours
            seconds = seconds + (Number(timeArray[0]) * 60 * 60);
            // minutes
            seconds = seconds + (Number(timeArray[1]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[2]);
        } else if (timeArray.length === 2) {
            // minutes
            seconds = seconds + (Number(timeArray[0]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[1]);
        }
        return Number(seconds);
    }

    function formatNumber (value, format, roundingFunction) {
        var negP = false,
            signed = false,
            optDec = false,
            abbr = '',
            abbrK = false, // force abbreviation to thousands
            abbrM = false, // force abbreviation to millions
            abbrB = false, // force abbreviation to billions
            abbrT = false, // force abbreviation to trillions
            abbrForce = false, // force abbreviation
            bytes = '',
            ord = '',
            abs = Math.abs(value),
            suffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            min,
            max,
            power,
            w,
            precision,
            thousands,
            d = '',
            neg = false;

        // check if number is zero and a custom zero format has been set
        if (value === 0 && zeroFormat !== null) {
            return zeroFormat;
        } else {
            // see if we should use parentheses for negative number or if we should prefix with a sign
            // if both are present we default to parentheses
            if (format.indexOf('(') > -1) {
                negP = true;
                format = format.slice(1, -1);
            } else if (format.indexOf('+') > -1) {
                signed = true;
                format = format.replace(/\+/g, '');
            }

            // see if abbreviation is wanted
            if (format.indexOf('a') > -1) {
                // check if abbreviation is specified
                abbrK = format.indexOf('aK') >= 0;
                abbrM = format.indexOf('aM') >= 0;
                abbrB = format.indexOf('aB') >= 0;
                abbrT = format.indexOf('aT') >= 0;
                abbrForce = abbrK || abbrM || abbrB || abbrT;

                // check for space before abbreviation
                if (format.indexOf(' a') > -1) {
                    abbr = ' ';
                    format = format.replace(' a', '');
                } else {
                    format = format.replace('a', '');
                }

                if (abs >= Math.pow(10, 12) && !abbrForce || abbrT) {
                    // trillion
                    abbr = abbr + languages[currentLanguage].abbreviations.trillion;
                    value = value / Math.pow(10, 12);
                } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9) && !abbrForce || abbrB) {
                    // billion
                    abbr = abbr + languages[currentLanguage].abbreviations.billion;
                    value = value / Math.pow(10, 9);
                } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6) && !abbrForce || abbrM) {
                    // million
                    abbr = abbr + languages[currentLanguage].abbreviations.million;
                    value = value / Math.pow(10, 6);
                } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3) && !abbrForce || abbrK) {
                    // thousand
                    abbr = abbr + languages[currentLanguage].abbreviations.thousand;
                    value = value / Math.pow(10, 3);
                }
            }

            // see if we are formatting bytes
            if (format.indexOf('b') > -1) {
                // check for space before
                if (format.indexOf(' b') > -1) {
                    bytes = ' ';
                    format = format.replace(' b', '');
                } else {
                    format = format.replace('b', '');
                }

                for (power = 0; power <= suffixes.length; power++) {
                    min = Math.pow(1024, power);
                    max = Math.pow(1024, power+1);

                    if (value >= min && value < max) {
                        bytes = bytes + suffixes[power];
                        if (min > 0) {
                            value = value / min;
                        }
                        break;
                    }
                }
            }

            // see if ordinal is wanted
            if (format.indexOf('o') > -1) {
                // check for space before
                if (format.indexOf(' o') > -1) {
                    ord = ' ';
                    format = format.replace(' o', '');
                } else {
                    format = format.replace('o', '');
                }

                ord = ord + languages[currentLanguage].ordinal(value);
            }

            if (format.indexOf('[.]') > -1) {
                optDec = true;
                format = format.replace('[.]', '.');
            }

            w = value.toString().split('.')[0];
            precision = format.split('.')[1];
            thousands = format.indexOf(',');

            if (precision) {
                if (precision.indexOf('[') > -1) {
                    precision = precision.replace(']', '');
                    precision = precision.split('[');
                    d = toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
                } else {
                    d = toFixed(value, precision.length, roundingFunction);
                }

                w = d.split('.')[0];

                if (d.split('.')[1].length) {
                    d = languages[currentLanguage].delimiters.decimal + d.split('.')[1];
                } else {
                    d = '';
                }

                if (optDec && Number(d.slice(1)) === 0) {
                    d = '';
                }
            } else {
                w = toFixed(value, null, roundingFunction);
            }

            // format number
            if (w.indexOf('-') > -1) {
                w = w.slice(1);
                neg = true;
            }

            if (thousands > -1) {
                w = w.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + languages[currentLanguage].delimiters.thousands);
            }

            if (format.indexOf('.') === 0) {
                w = '';
            }

            return ((negP && neg) ? '(' : '') + ((!negP && neg) ? '-' : '') + ((!neg && signed) ? '+' : '') + w + d + ((ord) ? ord : '') + ((abbr) ? abbr : '') + ((bytes) ? bytes : '') + ((negP && neg) ? ')' : '');
        }
    }

    /************************************
        Top Level Functions
    ************************************/

    numeral = function (input) {
        if (numeral.isNumeral(input)) {
            input = input.value();
        } else if (input === 0 || typeof input === 'undefined') {
            input = 0;
        } else if (!Number(input)) {
            input = numeral.fn.unformat(input);
        }

        return new Numeral(Number(input));
    };

    // version number
    numeral.version = VERSION;

    // compare numeral object
    numeral.isNumeral = function (obj) {
        return obj instanceof Numeral;
    };

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    numeral.language = function (key, values) {
        if (!key) {
            return currentLanguage;
        }

        if (key && !values) {
            if(!languages[key]) {
                throw new Error('Unknown language : ' + key);
            }
            currentLanguage = key;
        }

        if (values || !languages[key]) {
            loadLanguage(key, values);
        }

        return numeral;
    };
    
    // This function provides access to the loaded language data.  If
    // no arguments are passed in, it will simply return the current
    // global language object.
    numeral.languageData = function (key) {
        if (!key) {
            return languages[currentLanguage];
        }
        
        if (!languages[key]) {
            throw new Error('Unknown language : ' + key);
        }
        
        return languages[key];
    };

    numeral.language('en', {
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '$'
        }
    });

    numeral.zeroFormat = function (format) {
        zeroFormat = typeof(format) === 'string' ? format : null;
    };

    numeral.defaultFormat = function (format) {
        defaultFormat = typeof(format) === 'string' ? format : '0.0';
    };

    /************************************
        Helpers
    ************************************/

    function loadLanguage(key, values) {
        languages[key] = values;
    }

    /************************************
        Floating-point helpers
    ************************************/

    // The floating-point helper functions and implementation
    // borrows heavily from sinful.js: http://guipn.github.io/sinful.js/

    /**
     * Array.prototype.reduce for browsers that don't support it
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Compatibility
     */
    if ('function' !== typeof Array.prototype.reduce) {
        Array.prototype.reduce = function (callback, opt_initialValue) {
            'use strict';
            
            if (null === this || 'undefined' === typeof this) {
                // At the moment all modern browsers, that support strict mode, have
                // native implementation of Array.prototype.reduce. For instance, IE8
                // does not support strict mode, so this check is actually useless.
                throw new TypeError('Array.prototype.reduce called on null or undefined');
            }
            
            if ('function' !== typeof callback) {
                throw new TypeError(callback + ' is not a function');
            }

            var index,
                value,
                length = this.length >>> 0,
                isValueSet = false;

            if (1 < arguments.length) {
                value = opt_initialValue;
                isValueSet = true;
            }

            for (index = 0; length > index; ++index) {
                if (this.hasOwnProperty(index)) {
                    if (isValueSet) {
                        value = callback(value, this[index], index, this);
                    } else {
                        value = this[index];
                        isValueSet = true;
                    }
                }
            }

            if (!isValueSet) {
                throw new TypeError('Reduce of empty array with no initial value');
            }

            return value;
        };
    }

    
    /**
     * Computes the multiplier necessary to make x >= 1,
     * effectively eliminating miscalculations caused by
     * finite precision.
     */
    function multiplier(x) {
        var parts = x.toString().split('.');
        if (parts.length < 2) {
            return 1;
        }
        return Math.pow(10, parts[1].length);
    }

    /**
     * Given a variable number of arguments, returns the maximum
     * multiplier that must be used to normalize an operation involving
     * all of them.
     */
    function correctionFactor() {
        var args = Array.prototype.slice.call(arguments);
        return args.reduce(function (prev, next) {
            var mp = multiplier(prev),
                mn = multiplier(next);
        return mp > mn ? mp : mn;
        }, -Infinity);
    }        


    /************************************
        Numeral Prototype
    ************************************/


    numeral.fn = Numeral.prototype = {

        clone : function () {
            return numeral(this);
        },

        format : function (inputString, roundingFunction) {
            return formatNumeral(this, 
                  inputString ? inputString : defaultFormat, 
                  (roundingFunction !== undefined) ? roundingFunction : Math.round
              );
        },

        unformat : function (inputString) {
            if (Object.prototype.toString.call(inputString) === '[object Number]') { 
                return inputString; 
            }
            return unformatNumeral(this, inputString ? inputString : defaultFormat);
        },

        value : function () {
            return this._value;
        },

        valueOf : function () {
            return this._value;
        },

        set : function (value) {
            this._value = Number(value);
            return this;
        },

        add : function (value) {
            var corrFactor = correctionFactor.call(null, this._value, value);
            function cback(accum, curr, currI, O) {
                return accum + corrFactor * curr;
            }
            this._value = [this._value, value].reduce(cback, 0) / corrFactor;
            return this;
        },

        subtract : function (value) {
            var corrFactor = correctionFactor.call(null, this._value, value);
            function cback(accum, curr, currI, O) {
                return accum - corrFactor * curr;
            }
            this._value = [value].reduce(cback, this._value * corrFactor) / corrFactor;            
            return this;
        },

        multiply : function (value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) * (curr * corrFactor) /
                    (corrFactor * corrFactor);
            }
            this._value = [this._value, value].reduce(cback, 1);
            return this;
        },

        divide : function (value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) / (curr * corrFactor);
            }
            this._value = [this._value, value].reduce(cback);            
            return this;
        },

        difference : function (value) {
            return Math.abs(numeral(this._value).subtract(value).value());
        }

    };

    /************************************
        Exposing Numeral
    ************************************/

    // CommonJS module is defined
    if (hasModule) {
        module.exports = numeral;
    }

    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `numeral` as a global object via a string identifier,
        // for Closure Compiler 'advanced' mode
        this['numeral'] = numeral;
    }

    /*global define:false */
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return numeral;
        });
    }
}).call(this);

},{}],2:[function(require,module,exports){
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

			var search_input = search_area.append("input").attr("placeholder", "Type location to search...").classed("search-bar", true).attr("type", "text");

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

},{}],3:[function(require,module,exports){
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
		// var detached = d3.select(this).append("div")

		var detached = d3.select(this);

		var card_header = detached.append("div").classed("crime-card-header", true);
		var card_body = detached.append("div").classed("crime-card-body", true);

		var card_title = card_header.append("h3");

		var expander = card_title.append("span").classed("expander", true).html('<i class="fa fa-bar-chart" aria-hidden="true"></i>').on("click", function () {
			var body = d3.select(this.parentNode.parentNode.parentNode).select(".crime-card-body");
			if (body.style("display") == "none") {
				body.style("display", null);
			} else {
				body.style("display", "none");
			}
		});

		card_title.append("span").text(city);

		var city_data = data.filter(function (a) {
			return a[CITY_COL] == city;
		});

		// var crimes = city_data.map(function(a){
		// 	return a[CRIME_COL];
		// });

		var chart_area = card_body.append("div").classed("card-area", true);

		var chart_imgs = chart_area.selectAll(".chart").data(city_data).enter().append("div").classed("crime-area", true);

		chart_imgs.append("h5").text(function (d) {
			return d[CRIME_COL].replace("-", " "); // + ", " +  d[CITY_COL];
		});

		chart_imgs.append("img").classed("chart", true)
		// .on("focus", function(d){ // FAILED QUICK ATTEMPT AT LAZY LOADING	    
		//     d3.select(this).attr("src",
		// 			 d[CITY_COL] + "-"
		// 			 + d[CRIME_COL] + ".png");
		// })
		.attr("src", function (d) {
			return "img/" + d[CITY_COL] + "-" + d[CRIME_COL] + ".png";
		});

		card_body.append("div").classed("clear-both", true);
		var footnote = card_body.append("div").classed("footnote", true);

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
};

d3.csv(DATA_URL, go_with_data);

},{"./cards.js":2,"./helpers.js":4,"numeraljs":1}],4:[function(require,module,exports){
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
       width = 320;
   const margin = 40;
   const smallMargin = 10;

   svg.style("height", height + "px");
   svg.style("width", width + "px");

   var xScale = d3.scaleBand().domain(data.map(function (d) {
      return d[xCol];
   })).range([margin, width]);

   var yScale = d3.scaleLinear().domain([smallMargin, d3.max(data.map(function (d) {
      return d[yCol];
   }))]).range([height - margin, smallMargin]);

   var xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter(function (d, i) {
      return i % 10 == 0;
   }));

   var yAxis = d3.axisLeft(yScale).ticks(4);

   var xAxisDiv = svg.append("g").attr("transform", "translate(" + 0 + "," + (height - margin) + ")").call(xAxis);

   var yAxisDiv = svg.append("g").attr("class", "y axis").attr("transform", "translate(" + margin + "," + 0 + ")").call(yAxis);

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

   var pointArea = svg.append("g").classed("point-layer", true);

   var points = pointArea.selectAll(".point").data(data.filter(function (d) {
      return d[yCol] != "";
   })).enter().append("circle")
   // .classed("hidden", function(d){
   //     return d[yCol] == "";
   // })
   .classed("point", true).attr("cx", function (d) {
      return xScale(d[xCol]);
   }).attr("cy", function (d) {
      return yScale(d[yCol]);
   }).attr("r", 2);

   pointArea.attr("transform", "translate(" + margin + "," + 0 + ")");
};

exports.barChart = barChart;

},{}]},{},[3]);
