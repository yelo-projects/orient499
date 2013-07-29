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
app.use(require('./lib/stylus')(config));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

http.createServer(app).listen(config.port, function(){
  console.log('Express server listening on port ' + config.port);
});
