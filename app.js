#!/usr/bin/env node
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , config = require('konphyg')(__dirname + '/config/')('o499')
  ,	galleries = require('./lib/galleries')('public/photos',config.galleries)
  ,	stylus = require('./lib/stylus')(config)
  ,	fs = require('fs')
  ,	stylesheetPath = path.join(__dirname, 'styles/style.styl')
  , uglify = require('uglify-js')
  , scriptPath = path.join(__dirname, 'public/js/')
;

config.galleries = galleries;
var app = express();
app.locals(config)

app.set('port', process.env.PORT || config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(config.salt));
app.use(app.router);
if(config.is_dev){app.use(require('./lib/stylus')(config));}
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var listen = function(){
    http.createServer(app).listen(config.port, function(){
        console.log('Express server listening on port ' + config.port);
    });
}

if(!config.is_dev){
  var scripts = (function(scripts,rs){for(s in scripts){rs[s] = scriptPath+scripts[s]+'.js';};return rs;})(app.locals.scripts,[]);
  app.locals.js = uglify.minify(scripts).code;
  var styles = stylus(fs.readFileSync(stylesheetPath,{encoding:'utf8'}),stylesheetPath).render(function(err,css){
  	app.locals.css = css;
    listen()
  });
}else{
  listen();
}