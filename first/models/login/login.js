var mongodb = require('../db');
function Login(){

};
module.exports = Login ;
Login.checkName = function checkName(username, callback){
	mongodb.open(function(err, db){
		if (err) {
			return callback(err);
		}
		db.collection('users', function(err, collection){
			if (err){
				mongodb.close();
				return callback(err) ;
			}
			collection.findOne({userName:username}, function(err,doc){
				mongodb.close();
			if (doc){
				var state = 1;
				callback(err, state) ;
			} 
			else {
				callback(err, null) ;
			}
			});
		});
	});
}

