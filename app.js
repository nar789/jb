//0-1. header
var express = require('express');
var app = require('express')();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var config = require('./config.my');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var TimeAgo = require('javascript-time-ago');
var ko = require('javascript-time-ago/locale/ko');

TimeAgo.addLocale(ko);
const timeAgo=new TimeAgo('ko');



app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use('/assets',express.static(__dirname + '/assets'));
//app.use('/',express.static(__dirname + '/views'));
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
	    		req.session.userid=rows[0].id;
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
		req.session.userid=0;
		req.session.name='';
		req.session.email='';
		req.session.logined=false;
		req.session.save((err)=>{
			res.redirect('/');		
		});
	}
	
});


app.get('/view/phone/:model',function(req,res){
  var model=req.params.model;

  if(req.session===undefined)
  	req.session.logined=false;


  var query=`select phone.*,B.state from phone, (select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
				where phone.id=asset_id and phone.model='`+model+`' order by label asc;`;

  var query2=`select model, group_concat(distinct(sales)) as saleses, count(*) as cnt, count(if(state='rental',state,null)) as rental_cnt,count(if(state='return',state,null)) as return_cnt from phone p,(select asset_id,state from rental r where id=(select max(id) 
  from rental group by asset_id having asset_id=r.asset_id)) r 
  where r.asset_id=p.id and model='`+model+`' group by model;`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){

	    	var connection2 = mysql.createConnection(config);
	    	connection2.connect();
	    	connection2.query(query2, function(err, rows2, fields) {
			    if (!err){

			    	model=model.toUpperCase();
			    	res.render('view-phone.html',{user:req.session,rows:rows,model:model,rows2:rows2});
			    	//res.json(rows);
			    }
			    else res.send('fail');
			});	
	    }
	    else res.send('fail');
	});	
	connection.end();

  
});


app.get('/view/phone',function(req,res){
  

  if(req.session===undefined)
  	req.session.logined=false;


  var query=`select model, group_concat(distinct(sales)) as saleses, count(*) as cnt, count(if(state='rental',state,null)) as rental_cnt,count(if(state='return',state,null)) as return_cnt 
  from phone p,(select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) r 
  where r.asset_id=p.id group by model;`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.render('view-model-list.html',{user:req.session,rows:rows,model:''});
	    	//res.json(rows);
	    }
	    else res.send('fail');
	});	
	connection.end();

  
});


app.post('/api/phone/crud',function(req,res){
	var cmd=req.body.cmd;
	var opt=req.body.opt;
	/*
	if(cmd=='read' && opt==1)
	{
		var model=req.body.model;
		var query=`select phone.*,rental.state from phone,rental where rental.asset_id=phone.id and phone.model='`+model+`' group by phone.model having max(rental.write_dt) 
					union 
					select *,'return' as state from phone where phone.model='`+model+`' and id not in (select phone.id from phone,rental where rental.asset_id=phone.id and phone.model='`+model+`' group by phone.model having max(rental.write_dt))
					order by id asc;`;

		var connection = mysql.createConnection(config);
	    connection.connect();
	    connection.query(query, function(err, rows, fields) {
		    if (!err){
		    	res.json(rows);
		    }
		    else res.send('fail');
		});	
	    connection.end();
	}else */
	if(cmd=='create'){
		var model=req.body.model.toUpperCase();
		var nick=req.body.nick.toLowerCase();
		var sales=req.body.sales.toUpperCase();
		var label=req.body.label.toUpperCase();

		var query=`insert into phone values(null,'`+model+`','`+sales+`','`+nick+`','`+label+`')`;
		var connection = mysql.createConnection(config);
	    connection.connect();
	    connection.query(query, function(err, rows, fields) {
		    if (!err){
		    	res.send('success');
		    }
		    else res.send('fail');
		});	
	    connection.end();

	}else if(cmd=='update'){
		var id=req.body.id;
		var model=req.body.model.toUpperCase();
		var nick=req.body.nick.toLowerCase();
		var sales=req.body.sales.toUpperCase();
		var label=req.body.label.toUpperCase();
		var query=`update phone set model='`+model+`', nick='`+nick+`', sales='`+sales+`', label='`+label+`' where id=`+id;
		var connection = mysql.createConnection(config);
	    connection.connect();
	    connection.query(query, function(err, rows, fields) {
		    if (!err){
		    	res.send('success');
		    }
		    else res.send('fail');
		});	
	    connection.end();
	}else if(cmd=='delete'){
		var id=req.body.id;
		var query=`delete from phone where id=`+id;
		var connection = mysql.createConnection(config);
	    connection.connect();
	    connection.query(query, function(err, rows, fields) {
		    if (!err){
		    	res.send('success');
		    }
		    else res.send('fail');
		});	
	    connection.end();
	}else{
		res.send('fail');
	}
});



app.get('/view/history/:asset_id',function(req,res){
  

  if(req.session===undefined)
  	req.session.logined=false;

  var asset_id=req.params.asset_id;


  var query=`select rental.*,phone.*,name,email,nick from phone,rental,user where asset_id=phone.id and rental.user_id=user.id and asset_id=`+asset_id+` order by write_dt desc;`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	var title='';
	    	if(rows.length==0)
	    	{
	    		title='';
	    	}
	    	else {title = rows[0].model+' '+rows[0].label;
			    	title=title.toUpperCase();
			    }
	    	res.render('view-history.html',{user:req.session,rows:rows,title:title,nick:'disp'});
	    }
	    else res.send('fail');
	});	
	connection.end();

  
});



app.get('/view/history/user/:user_id',function(req,res){
  

  if(req.session===undefined)
  	req.session.logined=false;

  var user_id=req.params.user_id


  var query=`select rental.*,phone.*,name,email from phone,rental,user where asset_id=phone.id and rental.user_id=user.id and user_id=`+user_id+` order by write_dt desc;`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	var title='';
	    	if(rows.length==0)
	    	{
	    		title='';
	    	}
	    	else {title = rows[0].name+' '+rows[0].email;
			    	title=title.toUpperCase();
			    }
	    	res.render('view-history.html',{user:req.session,rows:rows,title:title,nick:'nope'});
	    }
	    else res.send('fail');
	});	
	connection.end();

  
});


app.get('/view/rental/pages/all',function(req,res){
  

  if(req.session===undefined)
  	req.session.logined=false;


  var query=`select user.*,rental.*,phone.*,count(*) as cnt,
group_concat(distinct(phone.label)) as labels,
unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models,
group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id group by write_dt order by write_dt desc;`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.render('view-rental-pages.html',{user:req.session,rows:rows,menu:'all',timeAgo:timeAgo});
	    }
	    else res.send('fail');
	});	
	connection.end();

});

app.get('/view/rental/pages/my',function(req,res){
  

  if(req.session===undefined)
  	req.session.logined=false;

  var query2=`select user.*,rental.*,phone.*,count(*) as cnt,group_concat(distinct(phone.label)) as labels,unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models
,group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id 
 and email='`+req.session.email+`'
  group by write_dt order by write_dt desc;`;

	
	var connection2 = mysql.createConnection(config);
	connection2.connect();
	connection2.query(query2, function(err, rows, fields) {
		if (!err){
			res.render('view-rental-pages.html',{user:req.session,rows:rows,menu:'my',timeAgo:timeAgo});
		}
		else res.send('fail');
	});
	connection2.end();
	

});


app.get('/view/request/rental',function(req,res){
  

  if(req.session===undefined)
  	req.session.logined=false;


  var query=`select phone.*,B.state from phone, (select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
where phone.id=asset_id order by model,label asc;`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.render('view-request-rental.html',{user:req.session,rows:rows});
	    }
	    else res.send('fail');
	});	
	connection.end();

});


app.post('/api/rental',function(req,res){
  

  var aids=req.body.aids;
  var state='';
  if(req.body.type==1)
  	state='rental';
  else state='return';
  var query=`insert into rental values`;
  if(aids===undefined ){
  	res.send('fail');
  	return;
  }
  for(var i=0;i<aids.length;i++)
  {
  	if(i!=0)query= query+",";
  	query= query+"(null,1,"+aids[i]+","+req.session.userid+",now(),'"+state+"')";
  }

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.send('success');
	    }
	    else res.send('fail');
	});	
	connection.end();
});


app.get('/view/rental/detail/:userid/:timestamp',function(req,res){

	if(req.session===undefined)
  	req.session.logined=false;

	var ts=req.params.timestamp;
	var uid=req.params.userid;
	var query=`select r.*,u.*,p.* from rental r,user u,phone p where unix_timestamp(write_dt)=`+ts+` and r.user_id=`+uid+` and r.asset_id=p.id and r.user_id=u.id;`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.render('view-rental-detail.html',{user:req.session,rows:rows,timeAgo:timeAgo});
	    }
	    else res.send('fail');
	});	
	connection.end();
});










//1. enetry point
app.listen(2323,function(){
  init();
  console.log('JB Server listen on *:2323');
});

function init(){

}