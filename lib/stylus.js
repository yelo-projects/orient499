var stylus = require('stylus')
,	utils = stylus.utils
,	nodes = stylus.nodes
,	nib = require('nib')
,	path = require('path')
;

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function endsWith(str, suffix) {
	return (typeof(str) == 'string') && str.indexOf(suffix, str.length - suffix.length) !== -1;
}

/**
 * Creates a stylus color node from a string
 * @param  {string} str #rgb or #rrggbb (you can ommit the "#")
 * @return {stylus.nodes.RGBA}     the stylus color object
 */
function colorNode(str) {

	var len,captures,rgb,r,g,b,color;

	rgb = (str[0] === '#') ? str.slice(1) : str;

	len = rgb.length;

	if(len==3) {
		r = parseInt(rgb[0] + rgb[0], 16)
		g = parseInt(rgb[1] + rgb[1], 16)
		b = parseInt(rgb[2] + rgb[2], 16)
	}else if(len==6){
		r = parseInt(rgb.substr(0, 2), 16)
		g = parseInt(rgb.substr(2, 2), 16)
		b = parseInt(rgb.substr(4, 2), 16)
	}else{
		throw new Error("could not parse",str);
		return;
	}

	color = new nodes.RGBA(r, g, b, 1);
	color.raw = str;
	return color;
}

/**
 * Creates a stylus unit node. "px" and "%" are recognized,
 * other suffixes (or no suffix) will be parsed as normal numbers
 * @param  {string} str "12px" or "10%" or "9.5"
 * @return {stylus.nodes.Unit}     the stylus unit object
 */
function unitNode(str){
	return endsWith(str,'px') ? new nodes.Unit(parseInt(str),"px") : endsWith(str,'%') ? new nodes.Unit(parseInt(str),"%") : new nodes.Unit(str);
}

var stylesOptions = {};

module.exports = function(config){

	var dirname = path.normalize(__dirname+'/..');

	//this part takes the configuration
	//and parses "styles.colors" and "styles.sizes"
	//"style.colors.header" will be available in the stylus
	//sheet as a variable named "color_header"
	//and "styles.sizes.buttonHeight" will be "size_buttonHeight"
	function makeStylusVars(config){
		var n,v;
		for(n in config.sizes){
			v = config.sizes[n];
			stylesOptions["size_"+n] = unitNode(v)
		}
		for(n in config.colors){
			v = config.colors[n];
			stylesOptions["color_"+n] = colorNode(v);
		}
		for(n in config.litterals){
			v = config.litterals[n];
			stylesOptions[n] = new stylus.nodes.Literal(v);
		}
	}

	function compile(str, path) {
		var n
		,	s = stylus(str)
				.set('filename', path)
				.set('compress', !config.is_dev)
				//.use(require('imageServer').stylusHelper(dirname,'images','public/images','../'))
				.use(nib())
				.import('nib')
			;
		for(n in stylesOptions){
			s.define(n,stylesOptions[n]);
		}
		return s;
	}

	
	makeStylusVars(config.styles);
	return (!config.is_dev ? compile : require('stylus').middleware({src:dirname + '/styles',dest:dirname+'/public',compile:compile}))
}
