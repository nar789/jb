//0-1. header
var express = require('express');
var app = require('express')();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var config = require('./config.my');
var session = require('express-session');
var FileStore = require('session-file-store')(session);



app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({
 secret: '!aajbaa!',
 resave: false,
 saveUninitialized: true,
 store: new FileStore(),
}));



//0-2. router
app.get('/intro',function(req,res) {
  res.send('2019 JzencBuwo proj. Designed by jh0511.lee. This is assets management system.');
});

app.get('/',function(req,res){
	console.log(req.session);
  if(req.session===undefined)
  	req.session.logined=false;
  	
  	res.render('index.html',{user:req.session});
});

app.get('/base',function(req,res){
	if(req.session===undefined)
  	req.session.logined=false;
  res.render('base.html',{user:req.session});
});

app.get('/m1',function(req,res){
	if(req.session===undefined)
  	req.session.logined=false;
  res.render('m1.html',{user:req.session});
});


app.post('/api/join',function(req,res){
  console.log(req.body.name +' '+req.body.email);
  var name=req.body.name;
  var email=req.body.email;
  var connection = mysql.createConnection(config);
  connection.connect();
  connection.query('insert into user values(null,\''+name+'\',\''+email+'\',\'\',0,\'\',\'\',0)', function(err, rows, fields) {
	  if (!err) res.send('success');
	  else res.send('fail');
	});
  connection.end();
  
});


app.post('/api/login',function(req,res){
	
	var email=req.body.email;
	var connection = mysql.createConnection(config);
    connection.connect();
    connection.query("select * from user where email=\'"+email+"\'", function(err, rows, fields) {
	    if (!err){
	    	if(rows.length===1){
	    		
	    		req.session.email=email;
	    		req.session.name=rows[0].name;
	    		req.session.logined=true;
	    		req.session.save(()=>{
	    			res.send(req.session.name);
	    		});
	    	}
	   		else res.send('fail');

	    }
	    else res.send('fail');
	});	
    connection.end();
});

app.get('/api/logout',function(req,res){
	if(req.session!=undefined){
		req.session.name='';
		req.session.email='';
		req.session.logined=false;
		req.session.save((err)=>{
			res.redirect('/');		
		});
	}
	
});











//1. enetry point
app.listen(2323,function(){
  init();
  console.log('JB Server listen on *:2323');
});

function init(){

}