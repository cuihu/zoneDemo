var mongodb = require('./db');

function User(user){
	this.userName = user.name ;
	this.password = user.password ;
};
module.exports = User ;

User.prototype.save = function save(callback){
	var user = {
		userName : this.userName ,
		userId : 0,
		password : this.password,
		nickname : ''	
	};
	mongodb.open(function(err,db){
		if (err){
			return callback(err) ;
		}
		console.log('collect to mongodb') ;
		db.collection('users',function(err, collection){
			if (err){
				mongodb.close();
				return callback(err) ;
			}
			db.collection('users.recordId',function(err,collection2){
				collection2.findOne({},function(err,doc){
					var nowId = doc.nowId ;
					user.userId = nowId ;
					collection2.update({"nowId":nowId},{"$inc":{"nowId":1}},function(err){
					if(err){
						mongodb.close();
						return callback(err);
					}					
					//collection.ensureIndex('userId', {unique:true}) ;
					collection.insert(user, {safe:true},function(err, user){
					mongodb.close();
					if(err){
						console.log('4');
					}
					callback(err, user);
					});
				});
				});
			});			
		});
	});
}

User.checkname = function checkname(username, callback){
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
				var user = {
					userName : doc.userName,
					userId : doc.userId,
					password:doc.password
				}
				callback(err, user) ;
			} 
			else {
				callback(err, null) ;
			}
			});
		});
	});
}