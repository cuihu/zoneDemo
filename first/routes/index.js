var User = require('../models/user.js');
var crypto = require('crypto') ;
var Post = require('../models/post.js') ;
var Sent = require('../models/sent.js') ;
var Login = require('../models/login/login.js')
var formidable = require("formidable");
module.exports = function(app){

	app.get('/', function(req, res){
		console.log('there');
		res.render('login/login', {
			title : 'express',
			layout:"false"
		}) ;
	});
	app.get('/checkuser',function(req,res){
		//console.log(req.body.userName);
		var url = require('url') ;
		var queryObj = url.parse(req.url,true).query;
		//console.log('checkUser');
		//console.log(queryObj.userName); 
		Login.checkName(queryObj.userName,function(err , state){
			console.log(state);
			if(state==1){
				res.send(queryObj.callback+'(\'{"type": "1"}\')');
			}
			else{
				res.send(queryObj.callback+'(\'{"type": "0"}\')');
			}
		})
		//res.send(queryObj.callback+'(\'{"message": "test"}\')'); 
	});
		//app.get('/login',checkNotLogin);
	app.post('/login', function(req, res){
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.pwd).digest('base64');

		User.checkname(req.body.username,function(err,user){
			if (!user){
				req.flash('error', 'no user') ;
				return res.redirect('/') ;
			}
			if (user.password != password){
				req.flash('error', 'password error') ;
				return res.redirect('/') ;
			}
			req.session.user = user ;
			req.flash('success', 'login success') ;
			res.redirect('/u/'+req.body.username) ;
		});
	});
	app.get('/hello',function(req,res){
		res.send('The time is ' + new Date().toString()) ;
	});
	app.get('/u/:user',function(req, res){
		User.checkname(req.params.user, function(err,user){
			if (!user){
				console.log(req.params.user) ;
				//req.flash('error', 'no user') ;
				return res.redirect('/') ;
			}
			Sent.getuserSent(user.name,function(err,sents){
				if(err){
					req.flash('error',err);
					return res.redirect('/');
				}			
				for (var p in sents){
					console.log(sents[p].sent);
				}
				res.render('user/userZone',{
				title:user.userName,
				id:req.session.user.userId,
				sents:sents,
				});	
			});
		});
	});
	app.get('/sentComment',function(req,res){
		var url = require('url') ;
		var a = url.parse(req.url,true).query;
		console.log(a.sentComment);
		console.log(a.imgAddr);
		Sent.sentComment(a.userName,a.imgAddr,a.sentComment, function(err , state){
			console.log(state);
			if(state){
				res.send(a.callback+'(\'{"type": "1"}\')');
			}
			else{
				res.send(a.callback+'(\'{"type": "0"}\')');
			}
		})
		//res.send(queryObj.callback+'(\'{"message": "test"}\')'); 
	});
	app.post('/uploadNewsImg',function(req,res){
		console.log('uploadimg');
		var formidable = require('formidable');
    	fs = require('fs');
    	TITLE = 'formidable上传示例';
    	AVATAR_UPLOAD_FOLDER = '/Images/';
   		domain = "http://localhost:3000";
		var form = new formidable.IncomingForm();   //创建上传表单
  		form.encoding = 'utf-8';        //设置编辑
 	    form.uploadDir = './public/Images/';     //设置上传目录
  		form.keepExtensions = true;     //保留后缀
 		form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
 		var filePath ;
 		console.log('there are test');
 		form.parse(req, function(err, fields, files) {
    		if (err) {
    			 //res.locals.error = err;
     			 //res.render('', { title: TITLE });
      			return;
   				 }
   			//console.log(fields);
    		//console.log(files);
    		var extName = '';  //后缀名
    		switch (files.uploadImage.type) {
     		 case 'image/pjpeg':
     	  	 extName = 'jpg';
      		  break;
     		 case 'image/jpeg':
       		 extName = 'jpg';
       		 break;
      		case 'image/png':
       		 extName = 'png';
       		 break;
      		case 'image/x-png':
       		 extName = 'png';
       		 break;
    		}

    		if(extName.length == 0){
     		 res.locals.error = '只支持png和jpg格式图片';
      		res.render('/user/userZone', { title: TITLE });
     		 return;
    		}
    		console.log('111:'+fields.uploadSent);
    		var usersent = fields.uploadSent ;
    		var b = new Date();
    		var avatarName = b.valueOf() + '.' + extName;
  		  //图片写入地址；
    		var newPath = form.uploadDir + avatarName;
   			 //显示地址；
  			  var showUrl = domain + AVATAR_UPLOAD_FOLDER + avatarName;
  			  console.log("newPath",newPath);
  			  filePath = newPath;
   			 fs.renameSync(files.uploadImage.path, newPath);  //重命名
   			 /*
   			 res.json({
     		 "newPath":showUrl
    			});
    		*/ 
    		 var user = req.session.user ;
   			 var sent = new Sent(user.userName,user.userId,usersent,avatarName);  			
   			 sent.save(function(err){
   			 	if(err){
   			 		res.json({
   			 			"faild":0
   			 		})
   			 		console("faild error");
   			 		}
   			 	 console.log('hhhhhhhh');	
   			 		res.json({
   			 			"success":1
   			 		});
   			 	});	
 			 });
 			console.log('fsafsd');
 

		//fs.writeFileSync(__dirname+'public/loadImg/1.jpg',req.body['uploadNewsImg']);
	});

	//app.get('/reg', checkNotLogin);
	app.post('/reg',function(req, res){
		console.log('get form') ;
		if(req.body['RegpwdCheck']!= req.body['Regpwd']){
			console.log('this is choose') ;
			console.log(req.body['Regpwd']);
			console.log(req.body['RegpwdCheck']);
			req.flash('error','not same') ;
			//req.flash('error', 'not same');
			return res.redirect('/');
		}
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.Regpwd).digest('base64');

		var newUser = new User({
			name : req.body.RegUsername,
			password:password,
		})

		User.checkname(newUser.name, function(err, user){
			if (user)
				err = 'Username already exists.';
			if (err){
				req.flash('error', err);
				return res.redirect('/');
			}
			console.log('save name') ;
			newUser.save(function(err){
				if (err) {
					req.flash('error', err) ;
					return res.redirect('/');
				}
				req.session.user = newUser ;
				req.flash('success', 'submit successful!');
				res.redirect('/');
			})

		});

		
	});

	app.get('/reg', function(req, res){
		res.render('reg',{
			title:'zhuce',
		});
	});

	app.get('/logout', function(req, res){
		req.session.user = null ;
		req.flash('success', 'logout');
		res.redirect('/') ;
	});
	/*
	app.post('/post', function(req, res){
		var currentUser = req.session.user ;
		var post = new Post(currentUser.name, req.body.post);
		post.save(function(err){
			if (err){
				req.flash('error', err) ;
				return req.redirect('/') ;
			}
			req.flash('success','post success') ;
			res.redirect('/u/' + currentUser.name) ;
		});
	});
*/
	/*
	function checkLogin(req,res,next){
		if (!req.session.user){
			req.flash('error', 'not login');
			return res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req, res,next){
		if (req.session.user){
			req.flash('error', 'login!');
			return res.redirect('/');
		}
		next();
	}
	*/

	// catch 404 and forward to error handler
	app.use(function(req, res, next) {
  	var err = new Error('Not Found');
  	err.status = 404;
  	next(err);
	});


	// error handler
	app.use(function(err, req, res, next) {
  	// set locals, only providing error in development
 	 res.locals.message = err.message;
  	res.locals.error = req.app.get('env') === 'development' ? err : {};

  	// render the error page
  	res.status(err.status || 500);
  	res.render('error');
	});
};

/*

 var express = require('express');
var router = express.Router();

/* GET home page. */
/*
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
 
*/