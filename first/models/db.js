
var settings = require('../settings');
var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
module.exports = new Db('zonedb', new Server(settings.host, 
	27017,{}));
/*
var settings = require('../settings') ;
var mongodb = require('mongodb');
var server = new mongodb.Server('127.0.0.1', 27017);
var Db = new mongodb.Db('zonedb',server).open(function(err, client){
	if (err) throw err ;
	console.log('connected to mongodb') ;
})

module.exports = Db ;
*/