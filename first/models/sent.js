var mongodb = require('./db');

function Sent(username, id , sent , imgAddr,time){
	this.userName = username ;
	this.userId = id ;
	this.sent = sent ;
	this.imgAddr = imgAddr ;
	this.sentComment = [];
	if (time){
		this.time = time ;
	}
	else {
		this.time = new Date() ;
	}

};

Sent.prototype.save = function save(callback){
	var sent = {
		userName : this.userName ,
		userId  : this.userId,
		sent : this.sent ,
		imgAddr:this.imgAddr,
		sentComment:this.sentComment,
		time : this.time , 
	};
		
	mongodb.open(function(err, db){
		console.log('Sent');
		if (err){
			return callback(err) ;
		}

		db.collection('sent', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}

			collection.ensureIndex('imgAddr') ;

			collection.insert(sent, {safe:true}, function(err, sent){
				mongodb.close();
				console.log('this sent');
				callback(err, sent) ;
			});
		});
	});
};

Sent.getuserSent = function getuserSent(userid, callback){
	mongodb.open(function(err, db){
		if (err) {
			return callback(err) ;
		}

		db.collection('sent', function(err, collection){
			if (err){
				mongodb.close() ;
				return callback(err) ;
			}

			var query = {} ;
			collection.find(query).sort({time: -1}).toArray(function(err, docs){
				mongodb.close() ;
				if(err){
					callback(err, null) ;
				}
				var sents = [] ;
				var i = 0 ;
				var k = [] ;
				docs.forEach(function(doc, index){
					var sent = new Sent(doc.userName,doc.userId,
						doc.sent,doc.imgAddr,doc.sentComment,doc.time) ;
					sents.push({userName:sent.userName,userId:sent.userId,
						sent:sent.sent,sentComment:sent.sentComment,
						imgAddr:sent.imgAddr,time:sent.time}) ;
					//console.log(JSON.stringify(sent));
					// console.log(index) ;
				});
				//console.log('this one'+JSON.stringify(sents[0].sentComment)) ;
				callback(null, sents) ;
			});
		});
	});
};

Sent.sentComment = function sentComment(userName,imgAddr,comment,callback){
	var Comment = {
		userName :userName ,
		imgAddr:imgAddr,
		oneComment:comment,
		time : new Date() ,
	};
	mongodb.open(function(err, db){
		if (err){
			return callback(err) ;
		}

		db.collection('sent', function(err, collection){
			if(err){
				mongodb.close() ;
				return callback(err) ;
			}
			console.log(Comment.oneComment);
			collection.ensureIndex('imgAddr') ;
			collection.update({"imgAddr":Comment.imgAddr}, {"$push":{"sentComment":
				{"CommentUserName":Comment.userName,"CommentText":Comment.oneComment,
				"CommentTime":Comment.time}}},{safe:true}, function(err){
				mongodb.close();
				if(err){
					return callback(err,false);
				}
				return callback(err, true) ;
			});
		});
	});
};
module.exports = Sent ;