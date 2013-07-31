var fs = require('fs');
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index',{},function(err,rendered){
  	if(err){return req.next(err);}
  	fs.writeFile('index.html', rendered, {encoding:'utf8'},function(err){
  		if(err){throw err;}
  		console.log('index.html generated');
	});
    res.send(rendered);
  });
};