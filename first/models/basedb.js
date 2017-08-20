var Util = require('./util');
var mongodb = require('mongodb');
var dbClient ;
module.exports = function(){
	__constructor();

	this.findOneById = function(tableName, idJson,callback){

	};

	this.insert = function(tableName, rowInfo , callback){
		connection(function(db){
			db.collection(tableName,function(err,collection){
				collection.insert(rowInfo,function(err, objects){
					if(err){
						callback(false);
					}
					else {
						callback(objects);
					}
				})
			})
		})
	};

	this.modify = function(tableName, idJson, rowinfo,callback){
		connection(function(db){
			db.collection(tableName,function(err, collection){
				var mongoId = new mongodb.objectID(id);
				collection.update({'_id':mongoId})
			})
		})
	};

	this.remove = function(tableName, idJson, callback){

	};

	this.find = function(tableName, whereJson, orderByJson,limitArr, 
		fieldArr, callback){

	};

	this.filterSelfRow = function(rowInfo){

	};

	function __constructor(){

	};

	function connection(callback){
		if(!db){
			var dbConfig = Util.get('dbconfig.json', 'db');
			var host = dbConfig['host'],
				port = dbConfig['port'],
				dbName = dbConfig['db_name'],
				server = new mongodb.server(host, port);
			dbClient = new mongodb.Db(dbName, server,{safe:false});
			dbClient.open(function(err, dbObject){
				dbObject.authenticate(user, password, function(err, 
					dbObject){
					db = dbObject ;
					callback(dbObject);
					console.log('connection success');
				})
			});
		}
		else {
			callback(db);
		}
	}

}