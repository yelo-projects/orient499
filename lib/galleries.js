var fs = require('fs')
,	path = require('path');
;

module.exports = exports = function galleries(root,order){

	function makeDescription(file,name){
		var descFile = file+'.txt';
		if(fs.existsSync(descFile)){
			return superSimpleMarkup(fs.readFileSync(descFile,'utf8'))
		}
		return {title:'', desc:''};
	}

	var imagesDir = path.normalize(__dirname+'/../'+root+'/');

	var superSimpleMarkup = function(text){
		text = text.replace(/\n\r|\r\n|\r/gi,'\n').split('\n');
		return {
			title: text.shift()
		,	desc: text.join('\n')
			.replace(/^\n/,'')
			.replace(/(#+)(.*?)(#|\n)/gi,function(full,hashes,sentence,last){
				return '<h'+hashes.length+'>'+sentence+'</h'+hashes.length+'>';
			})
			.replace(/\n/g,'<br>')
		}

	}

	var findByProperty = function(arr, property, searchTerm,fromIndex){
		var i=fromIndex||0,l=arr.length;
	    for(i;i<l;i++){
	        if(arr[i].hasOwnProperty(property) && arr[i][property] === searchTerm){return i};
	    }
	    return -1;
	}

	var sortByArrayByArray = function(orig,order){
		var i = 0, l = order.length,el,index=0,indices = {};
		for(l>=0;l--;){
			index = findByProperty(orig,'id',order[l]);
			orig.unshift(orig.splice(index,1)[0]);
		}
		return orig;
	}

	var galleriesDir = fs.readdirSync(imagesDir);
	var galleries = [];

	for(var n in galleriesDir){
		galleries.push({
			id: galleriesDir[n]
		,	desc: makeDescription(imagesDir+galleriesDir[n]+'/'+'_info')
		,	images: fs.readdirSync(imagesDir+galleriesDir[n]).map(function(name){
				file = galleriesDir[n]+'/'+name;
				name = name.split('.');
				var ext = name.pop();
				if(ext == 'txt'){return false;}
				name = name.join('');
				var desc = makeDescription(imagesDir+galleriesDir[n]+'/'+name,name);
				return {
					title:desc.title
				,	desc:desc.desc
				,	name:name
				,	file:file
				,	ext: ext
				}
			}).filter(function(item){
				return item !== false;
			})
		}) - 1;
	}

	return order ? sortByArrayByArray(galleries,order) : galleries;
}