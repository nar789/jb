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
 cookie:{
 	maxAge:24000*60*60*30,
 },
 store: new FileStore(),
}));

function logincheck(req,res)
{
	if(req.session===undefined){
	  	req.session.logined=false;
	  	res.render('pages-404.html');
	  	return false;
	}else if(!req.session.logined){
		res.render('pages-404.html');
		return false;
	}else return true;
}



//0-2. router
app.get('/intro',function(req,res) {
  res.send('2019 JzencBuwo proj. Designed by jh0511.lee. This is assets management system.');
});

 function date_to_str(d) {
    var y=d.getFullYear();
    var m=d.getMonth()+1;
    var day=d.getDate();
    if(m<10)m="0"+m;
    if(day<10)day="0"+day;
    return y+"-"+m+"-"+day;
}

app.get('/',function(req,res){
	console.log(req.session);
    if(req.session===undefined){
    	req.session.logined=false;
    }

  	var query=`select A.model model,A.saleses saleses,ifnull(B.state,'return') state,A.cnt cnt,ifnull(B.rental_cnt,0) rental_cnt,(cnt-ifnull(rental_cnt,0)) return_cnt from 
(select model,group_concat(distinct(sales)) as saleses,count(*) as cnt from phone group by model) A
 left join
(select p.model,state,count(if(state='rental',state,null)) as rental_cnt 
from rental r,phone p where r.id=(select max(id) from rental group by asset_id having asset_id=r.asset_id) and p.id=r.asset_id group by model) B on A.model=B.model`;

  	
	var end=date_to_str(new Date());
    var d=new Date();
    var w=d.getTime()-(7*24*60*60*1000);
    d.setTime(w);
    var start=date_to_str(d);


	
  	var query2=`select model,count(*) as cnt from rental,phone where phone.id=rental.asset_id and write_dt between '${start}' and '${end} 23:59:59' group by model;`;
  	var query3=`select count(if(state='rental',state,null)) rental_cnt,count(if(state='return',state,null)) return_cnt,date_format(write_dt,"%m월%d일") d from rental
  where write_dt between '${start}' and '${end} 23:59:59' group by date(write_dt);`;
  	var connection = mysql.createConnection(config);
  	connection.connect();
  	connection.query(query, function(err, rows, fields) {
	  if (!err){

	  		
	  		var connection2 = mysql.createConnection(config);
		  	connection2.connect();
		  	connection2.query(query2, function(err, rows2, fields) {
			  if (!err){

			  			var connection3 = mysql.createConnection(config);
					  	connection3.connect();
					  	connection3.query(query3, function(err, rows3, fields) {
					  		if (!err){
	  								res.render('index.html',{user:req.session,rows:rows,rows2:rows2,rows3:rows3});
	  						}else res.send('fail');
	  					});
	  					connection3.end();


	  			}else res.send('fail');
	  		});
	  		connection2.end();


	  }
	  else res.send('fail');
	});
  connection.end();
  	
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

app.post('/api/user/update',function(req,res){
  //console.log(req.body.name +' '+req.body.email);
  var name=req.body.name;
  var email=req.body.email;
  var uid=req.body.uid;

  var query=`update user set name='`+name+`', email='`+email+`' where id=`+uid;


  var connection = mysql.createConnection(config);
  connection.connect();
  connection.query(query, function(err, rows, fields) {
	  if (!err) res.send('success');
	  else res.send('fail');
	});
  connection.end();
  
});

app.post('/api/user/delete',function(req,res){
  //console.log(req.body.name +' '+req.body.email);
  var uid=req.body.uid;

  var query=`delete from user where id=`+uid;

  var connection = mysql.createConnection(config);
  connection.connect();
  connection.query(query, function(err, rows, fields) {
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

  if(!logincheck(req,res))return;


  var query=`select * from (select A.*,ifnull(B.state,'return') state from
 (select * from phone) A left join
 (select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id) K where model='`+model+`';`;

  var query2=`select * from (
select A.model model,A.saleses saleses,ifnull(B.state,'return') state,A.cnt cnt,ifnull(B.rental_cnt,0) rental_cnt,(cnt-ifnull(rental_cnt,0)) return_cnt from 
(select model,group_concat(distinct(sales)) as saleses,count(*) as cnt from phone group by model) A
 left join
(select p.model,state,count(if(state='rental',state,null)) as rental_cnt 
from rental r,phone p where r.id=(select max(id) from rental group by asset_id having asset_id=r.asset_id) and p.id=r.asset_id group by model) B on A.model=B.model) K 
where model='`+model+`';`;

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
  

  if(!logincheck(req,res))return;


  var query=`select A.model model,A.saleses saleses,ifnull(B.state,'return') state,A.cnt cnt,ifnull(B.rental_cnt,0) rental_cnt,(cnt-ifnull(rental_cnt,0)) return_cnt from 
(select model,group_concat(distinct(sales)) as saleses,count(*) as cnt from phone group by model) A
 left join
(select p.model,state,count(if(state='rental',state,null)) as rental_cnt 
from rental r,phone p where r.id=(select max(id) from rental group by asset_id having asset_id=r.asset_id) and p.id=r.asset_id group by model) B on A.model=B.model`;

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

		var query=`insert into phone
		select * from (select null,'`+model+`','`+sales+`','`+nick+`','`+label+`') as tmp
		 where not exists (select nick from phone where nick='${nick}') limit 1`;
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
	}else if(cmd=='check'){
		var s=req.body.serial;
		var query=`select id from phone where nick like '%${s}%';`;
		var connection = mysql.createConnection(config);
	    connection.connect();
	    connection.query(query, function(err, rows, fields) {

		    if (!err){
		    	if(rows.length==1){
		    		var k=rows[0].id;
		    		res.send(k+'');
		    	}else res.send('fail');

		    }
		    else res.send('fail');
		});	
	    connection.end();

	}
	else{
		res.send('fail');
	}
});



app.get('/view/history/:asset_id',function(req,res){
  

  if(!logincheck(req,res))return;

  var asset_id=req.params.asset_id;


  var query=`select rental.*,phone.*,name,email,nick from phone,rental,user where asset_id=phone.id and rental.user_id=user.id and asset_id=`+asset_id+` order by write_dt desc;`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	
	    	var title='';
	    	if(rows.length==0)
	    	{
	    		title='대여 정보가 없습니다.';
	    	}
	    	else {title = rows[0].model+' '+rows[0].label;
			    	title=title.toUpperCase();
			}
			
	    	res.render('view-history.html',{user:req.session,rows:rows,title:title,nick:'disp',timeAgo:timeAgo});
	    }
	    else res.send('fail');
	});	
	connection.end();

  
});



app.get('/view/history/user/:user_id',function(req,res){
  

  if(!logincheck(req,res))return;

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
	    	res.render('view-history.html',{user:req.session,rows:rows,title:title,nick:'nope',timeAgo:timeAgo});
	    }
	    else res.send('fail');
	});	
	connection.end();

  
});


app.get('/view/rental/pages/all',function(req,res){
  

  if(!logincheck(req,res))return;


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
  

  if(!logincheck(req,res))return;

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

app.get('/view/rental/pages/stg',function(req,res){
  

  if(!logincheck(req,res))return;


  var query=`select * from (
 select rental.write_dt,rental.state,rental.user_id,user.name,count(*) as cnt,
group_concat(distinct(phone.label)) as labels,
unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models,
group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id 
 group by write_dt order by write_dt desc) K where models regexp (select replace(filter,',','|') from page where name='stg');`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.render('view-rental-pages.html',{user:req.session,rows:rows,menu:'stg',timeAgo:timeAgo});
	    }
	    else res.send('fail');
	});	
	connection.end();

});

app.get('/view/rental/pages/tablet',function(req,res){
  

  if(!logincheck(req,res))return;


  var query=`select * from (
 select rental.write_dt,rental.state,rental.user_id,user.name,count(*) as cnt,
group_concat(distinct(phone.label)) as labels,
unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models,
group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id 
 group by write_dt order by write_dt desc) K where models regexp (select replace(filter,',','|') from page where name='tablet');`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.render('view-rental-pages.html',{user:req.session,rows:rows,menu:'tablet',timeAgo:timeAgo});
	    }
	    else res.send('fail');
	});	
	connection.end();

});

app.get('/view/rental/pages/mass',function(req,res){
  

  if(!logincheck(req,res))return;


  var query=`select * from (
 select rental.write_dt,rental.state,rental.user_id,user.name,count(*) as cnt,
group_concat(distinct(phone.label)) as labels,
unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models,
group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id 
 group by write_dt order by write_dt desc) K where models regexp (select replace(filter,',','|') from page where name='mass');`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.render('view-rental-pages.html',{user:req.session,rows:rows,menu:'mass',timeAgo:timeAgo});
	    }
	    else res.send('fail');
	});	
	connection.end();

});

app.get('/api/filter/:page',function(req,res){
	var page=req.params.page; //stg|mass|tablet
	var query=`select group_concat(distinct(p.model)) models,f.filter from phone p,page f where f.name='${page}';`;
	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	if(rows.length!=0)
    			res.json(rows[0]);
    		else
    			res.send('fail');
	    }
	    else res.send('fail');
	});	
	connection.end();
});


app.get('/view/request/rental',function(req,res){
  

  if(!logincheck(req,res))return;


  var query=`select A.*,ifnull(B.state,'return') state from
 (select * from phone) A left join
 (select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id`;

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


app.post('/api/cli/rental',function(req,res){
  
  var aids=req.body.aids;
  var email=req.body.email;
  var state='';
  if(req.body.type==1)
  	state='rental';
  else state='return';

  var query2=`select id from user where email like '%${email}%'`;
  var connection2 = mysql.createConnection(config);
	connection2.connect();
	connection2.query(query2, function(err, rows2, fields) {
	    if (!err){
	    	var uid=rows2[0].id;

	    	var query=`insert into rental values`;
			  if(aids===undefined ){
			  	res.send('fail');
			  	return;
			  }
			  for(var i=0;i<aids.length;i++)
			  {
			  	if(i!=0)query= query+",";
			  	query= query+"(null,1,"+aids[i]+","+uid+",now(),'"+state+"')";
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

	    }
	    else res.send('fail');
	});	
	connection2.end();


});


app.get('/view/rental/detail/:userid/:timestamp',function(req,res){

	if(!logincheck(req,res))return;

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


app.get('/view/user',function(req,res){

	if(!logincheck(req,res))return;


	  var query=`select * from user`;

	  var connection = mysql.createConnection(config);
		connection.connect();
		connection.query(query, function(err, rows, fields) {
		    if (!err){
		    	res.render('view-user-list.html',{user:req.session,rows:rows});
		    }
		    else res.send('fail');
		});	
		connection.end();

});




app.post('/api/find/asset',function(req,res){

	var type=req.body.type;
	var serial=req.body.serial;

	var query='';
	if(type==='nick')
	{	

		query=`select * from (select A.*,ifnull(B.state,'return') state from
 (select * from phone) A left join
 (select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id) k where k.nick like '%`+serial+`%';`;

	}else if(type==='label'){
		serial=serial.split(' ');
		var model=serial[0];
		//model=model.toUpperCase();
		var label=serial[1];
		//label=label.toUpperCase();




		query=`select * from (select A.*,ifnull(B.state,'return') state from
 (select * from phone) A left join
 (select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id) k where k.model like '%`+model+`%' and k.label like '%`+label+`%';`;

	}
	if(query===''){
		res.send('fail');return;
	}
	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	if(rows.length==0){
	    		res.send('fail');
	    		return;		
	    	}
	    	res.json(rows);
	    }
	    else res.send('fail');
	});	
	connection.end();
});


app.post('/api/find/asset/user',function(req,res){
	var uid=req.session.userid;
	var state=req.body.state;

	var query=`select A.*,ifnull(B.state,'return') state,B.user_id from
 (select * from phone) A left join
 (select user_id,asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id where state='`+state+`' and user_id=`+uid+`;`;
 	//console.log(query);
 	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.json(rows);
	    }
	    else res.send('fail');
	});	
	connection.end();
});

app.get('/api/find/asset/filter/:name',function(req,res){
	var name=req.params.name;

	var query=`select A.*,ifnull(B.state,'return') state,B.user_id from
 (select * from phone) A left join
 (select user_id,asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id where model regexp (select replace(filter,',','|') from page where name='${name}');`;
 	//console.log(query);
 	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.json(rows);
	    }
	    else res.send('fail');
	});	
	connection.end();
});




app.post('/api/filter/update',function(req,res){
	var name=req.body.name;
	var filter=req.body.filter;

	var query=`update page set filter='${filter}' where name='${name}'`;

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


app.get('/view/chart',function(req,res){
	if(!logincheck(req,res))return;

	res.render('view-chart.html',{user:req.session});
});

app.get('/view/chart2',function(req,res){
	if(!logincheck(req,res))return;

	res.render('view-chart2.html',{user:req.session});
});



app.post('/api/rental/date',function(req,res){
	var start=req.body.start;
	var end=req.body.end;
	var query=`select date_format(write_dt,'%Y-%m-%d %H:%i:%s') dt,user.*,rental.*,phone.*,count(*) as cnt,group_concat(distinct(phone.label)) as labels,unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models
,group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id and write_dt between '${start}' and '${end} 23:59:59' group by write_dt order by write_dt desc;`;

   var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.json(rows);
	    }
	    else res.send('fail');
	});	
	connection.end();
});

app.post('/api/rental/date/graph',function(req,res){
	var start=req.body.start;
	var end=req.body.end;
	var query=`select model,count(*) as cnt from rental,phone where phone.id=rental.asset_id and write_dt between '${start}' and '${end} 23:59:59' group by model;`;

   var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.json(rows);
	    }
	    else res.send('fail');
	});	
	connection.end();
});


app.post('/api/rental/date/graph2',function(req,res){
	var start=req.body.start;
	var end=req.body.end;
	var query=`select count(if(state='rental',state,null)) rental_cnt,count(if(state='return',state,null)) return_cnt,date_format(write_dt,"%m월%d일") d from rental
  where write_dt between '${start}' and '${end} 23:59:59' group by date(write_dt);`;

   var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.json(rows);
	    }
	    else res.send('fail');
	});	
	connection.end();
});


app.get('/view/404',function(req,res){
	res.redirect('pages-404.html');
});






//1. enetry point
app.listen(2323,function(){
  init();
  console.log('JB Server listen on *:2323');
});

function init(){

}