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


var multer  = require('multer');
var upload = multer({ dest: './uploads' });

var XLSX = require('xlsx');

var randomColor = require('randomColor');


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
/*
  	var query=`select A.model model,A.saleses saleses,ifnull(B.state,'return') state,A.cnt cnt,ifnull(B.rental_cnt,0) rental_cnt,(cnt-ifnull(rental_cnt,0)) return_cnt from 
(select model,group_concat(distinct(sales)) as saleses,count(*) as cnt from phone group by model) A
 left join
(select p.model,state,count(if(state='rental',state,null)) as rental_cnt 
from rental r,phone p where r.id=(select max(id) from rental group by asset_id having asset_id=r.asset_id) and p.id=r.asset_id group by model) B on A.model=B.model limit 9`;*/

  	
	var end=date_to_str(new Date());
    var d=new Date();
    var w=d.getTime()-(7*24*60*60*1000);
    d.setTime(w);
    var start=date_to_str(d);


	
  	var query2=`select model,count(*) as cnt from rental,phone where phone.id=rental.asset_id and write_dt between '${start}' and '${end} 23:59:59' group by model;`;
  	var query3=`select count(if(state='rental',state,null)) rental_cnt,count(if(state='return',state,null)) return_cnt,date_format(write_dt,"%m월%d일") d from rental
  where write_dt between '${start}' and '${end} 23:59:59' group by date(write_dt);`;
  	//var connection = mysql.createConnection(config);
  	//connection.connect();
  	//connection.query(query, function(err, rows, fields) {
//	  if (!err){

	  		
	  		var connection2 = mysql.createConnection(config);
		  	connection2.connect();
		  	connection2.query(query2, function(err, rows2, fields) {
			  if (!err){

			  			var connection3 = mysql.createConnection(config);
					  	connection3.connect();
					  	connection3.query(query3, function(err, rows3, fields) {
					  		if (!err){
	  								//res.render('index.html',{user:req.session,rows:rows,rows2:rows2,rows3:rows3,randomColor:randomColor});
	  								res.render('index.html',{user:req.session,rows2:rows2,rows3:rows3,randomColor:randomColor});
	  						}else res.send('fail');
	  					});
	  					connection3.end();


	  			}else res.send('fail');
	  		});
	  		connection2.end();


//	  }
//	  else res.send('fail');
//	});
//  connection.end();
  	
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

  var page=req.query.page;
  var search=req.query.search;

  if(page===undefined || page=='')page=1;
  page=parseInt(page);
  var start=(page-1)*10;

  if(!logincheck(req,res))return;

/*0530목요일 업뎃 라스트유저네임땜시*/
/*
  var query=`select * from (select A.*,ifnull(B.state,'return') state from
 (select * from phone) A left join
 (select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id) K where model='`+model+`';`;*/

 var search_qry=``;
 if(search!=undefined && search!='')
 	search_qry=`and (model like '%${search}%' or sales like '%${search}%' or nick like '%${search}%' or label like '%${search}%' or imei like '%${search}%' or barcode like '%${search}%')`;

/*
 var query=`select *,date_format(last_dt,'%Y-%m-%d %H:%i:%s') dt from ((select * from (select A.*,ifnull(B.state,'return') state from
 (select * from phone) A left join
 (select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id) K left join (select id as uid,name as last_user_name from user) D on K.last_user=D.uid)) P where model='${model}' ${search_qry} limit ${start},10;`;


  var query2=`select * from (
select A.model model,A.saleses saleses,ifnull(B.state,'return') state,A.cnt cnt,ifnull(B.rental_cnt,0) rental_cnt,(cnt-ifnull(rental_cnt,0)) return_cnt from 
(select model,group_concat(distinct(sales)) as saleses,count(*) as cnt from phone group by model) A
 left join
(select p.model,state,count(if(state='rental',state,null)) as rental_cnt 
from rental r,phone p where r.id=(select max(id) from rental group by asset_id having asset_id=r.asset_id) and p.id=r.asset_id group by model) B on A.model=B.model) K 
where model='`+model+`';`;

*/

	var query=`select *,date_format(last_dt,'%Y-%m-%d %H:%i:%s') dt from phone where model='${model}' ${search_qry} limit ${start},10`; 

	var query2=`select count(*) cnt from (select * from phone where model='${model}' ${search_qry})K `;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){

	    	var connection2 = mysql.createConnection(config);
	    	connection2.connect();
	    	connection2.query(query2, function(err, rows2, fields) {
			    if (!err){

			    	model=model.toUpperCase();
			    	res.render('view-phone.html',{user:req.session,rows:rows,model:model,rows2:rows2,page:page,search:search});
			    	//res.json(rows);
			    }
			    else res.send('fail');
			});	
	    }
	    else res.send('fail');
	});	
	connection.end();

  
});

app.get('/api/view/get-phone-info',function(req,res){
	var id=req.query.id
	var query=`select * from phone where id=${id};`;
	
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

app.get('/api/view/get-rental-state',function(req,res){
	var id=req.query.id
	var query=`select asset_id,state from rental where id=(select max(id) from rental where asset_id=${id});`;
	
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

app.get('/api/view/get-username',function(req,res){
	var id=req.query.id
	var query=`select name from user where id=${id}`;
	
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

app.get('/api/view/get-rental-cnt',function(req,res){
	var model=req.query.model;
	/*
	var query=`select count(*) rental_cnt from (
select asset_id,state from rental r 
where id=(select max(id) from rental where asset_id=r.asset_id) 
and 
r.asset_id in (select id from phone where model='${model}'))K where K.state='rental';`;*/

	var query=`select id from phone where model='${model}'`;
	var query2=`select asset_id,state from rental order by id asc`;
	
	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){


	    	var connection2 = mysql.createConnection(config);
			connection2.connect();
			connection2.query(query2, function(err, rows2, fields) {
			    if (!err){

			    	var assets={};
			    	for(var i=0;i<rows2.length;i++)
			    	{
			    		assets[rows2[i].asset_id]={};
			    		assets[rows2[i].asset_id].state=rows2[i].state;
			    	}
			    	var rental_cnt=0;
			    	for(var i=0;i<rows.length;i++)
			    	{
			    		if(assets[rows[i].id]===undefined || assets[rows[i].id].state===undefined)continue;
			    		else if(assets[rows[i].id].state=='rental')rental_cnt=rental_cnt+1;
			    	}

			    	var ret=[];
			    	ret.push({rental_cnt:rental_cnt});
			    	res.json(ret);

			    }
			    else res.send('fail');
			});	
			connection2.end();
			
	    }
	    else res.send('fail');
	});	
	connection.end();

});

app.get('/api/view/get-total',function(req,res){
	var model=req.query.model;
	var query=`select count(*) total from phone where model='${model}'`;
	
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


app.get('/view/phone',function(req,res){
  

  if(!logincheck(req,res))return;


  var page=req.query.page;
  var search=req.query.search;

  if(page===undefined || page=='')page=1;
  page=parseInt(page);
  var start=(page-1)*10;


  var search_qry=``;
 if(search!=undefined && search!='')
 	search_qry=`where model like '%${search}%' or saleses like '%${search}%'`;

 var query=`select * from (select model,group_concat(distinct(sales)) saleses,count(*) cnt from phone group by model)K ${search_qry} limit ${start},10;`;
 var query2=`select count(*) cnt from (select model,group_concat(sales) saleses,count(*) cnt from phone group by model )K ${search_qry};`;

 console.log(query);

/*
  var query=`select * from (select A.model model,A.saleses saleses,ifnull(B.state,'return') state,A.cnt cnt,ifnull(B.rental_cnt,0) rental_cnt,(cnt-ifnull(rental_cnt,0)) return_cnt from 
(select model,group_concat(distinct(sales)) as saleses,count(*) as cnt from phone group by model) A
 left join
(select p.model,state,count(if(state='rental',state,null)) as rental_cnt 
from rental r,phone p where r.id=(select max(id) from rental group by asset_id having asset_id=r.asset_id) and p.id=r.asset_id group by model) B on A.model=B.model) K ${search_qry} limit ${start},10;`;


var query2=`select count(*) as cnt from (select A.model model,A.saleses saleses,ifnull(B.state,'return') state,A.cnt cnt,ifnull(B.rental_cnt,0) rental_cnt,(cnt-ifnull(rental_cnt,0)) return_cnt from 
(select model,group_concat(distinct(sales)) as saleses,count(*) as cnt from phone group by model) A
 left join
(select p.model,state,count(if(state='rental',state,null)) as rental_cnt 
from rental r,phone p where r.id=(select max(id) from rental group by asset_id having asset_id=r.asset_id) and p.id=r.asset_id group by model) B on A.model=B.model) K ${search_qry};`;*/

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){

	    	var connection2 = mysql.createConnection(config);
			connection2.connect();
			connection2.query(query2, function(err, rows2, fields) {
			    if (!err){

	    			res.render('view-model-list.html',{user:req.session,rows:rows,model:'',rows2:rows2,page:page,search:search});
			    			}
			    else res.send('fail');
			});	
			connection2.end();
	    	//res.json(rows);
	    }
	    else res.send('fail');
	});	
	connection.end();

  
});

app.post('/api/excel-text-insert',function(req,res){
	var line=req.body.qry.split('\n');
	//console.log(line.length);

	var query=`insert into phone values `;

	for(var i=0;i<line.length;i++)
	{
		var d=line[i].split('\t');
		if(d.length!=9)continue;

		var model=d[0]+'';
		model=model_name_preprocessing(model);
		model=model.toUpperCase();

		var barcode=d[1]+'';
		barcode=barcode.toLowerCase();

		var label=d[2]+'';
		label=label.replace(/ /gi, "");
		label=label.toUpperCase();


		var sales=d[3]+'';
		sales=sales.toUpperCase();


		var imei=d[4]+'';
		imei=imei_check(imei);

		var device_state=d[5]+'';
		var to_email=d[6]+'';
		var from_email=d[7]+'';
		var device_comment=d[8]+'';

		
		if(i!=line.length-1 && i!=0)
			query=query+`,`;
		if(imei=='')
			query=query+`(null,'${model}','${sales}','','${label}',concat('noimei_',model,'_',label,'_',floor(rand()*100000)),'${barcode}','${device_state}','${to_email}','${from_email}','${device_comment}',${req.session.userid},now())`;
		else
			query=query+`(null,'${model}','${sales}','','${label}','${imei}','${barcode}','${device_state}','${to_email}','${from_email}','${device_comment}',${req.session.userid},now())`;


		//console.log(model+' '+barcode+' '+label+' '+sales+' '+imei);
		console.log(`(null,'${model}','${sales}','','${label}','${imei}','${barcode}','${device_state}','${to_email}','${from_email}','${device_comment}',${req.session.userid},now())`);
	}

	query=query+`on duplicate key update model=values(model),sales=values(sales),label=values(label),nick=values(nick),imei=values(imei),barcode=values(barcode),device_state=values(device_state),to_email=values(to_email),from_email=values(from_email),device_comment=values(device_comment);`;
	console.log(query);
	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
	    	res.send('success');
			//res.render('import-excel-file-complete.html');    	
	    	//res.json(rows);
	    }
	    else res.send('fail');
	});	
	connection.end();

});

app.post('/excel',upload.single('excelfile'),function(req,res,next){
	console.log(req.file.path);
	//todo-processing();
	var workbook = XLSX.readFile(req.file.path);
	var fsn=workbook.SheetNames[0];
	var fs=workbook.Sheets[fsn];
	const start_row=2;

	var query=`insert into phone values `;
	for(var i=start_row;;i++){
		var model_addr="A"+i;
		var barcode_addr="B"+i;
		var label_addr="C"+i;
		var sales_addr="D"+i;
		var imei_addr="E"+i;
		if(fs[model_addr]===undefined)break;

		var model=fs[model_addr].v+'';
		model=model_name_preprocessing(model);
		model=model.toUpperCase();

		var barcode='';
		if(fs[barcode_addr]!==undefined)barcode=fs[barcode_addr].v+'';
		barcode=barcode.toLowerCase();

		var label='';
		if(fs[label_addr]!==undefined)label=fs[label_addr].v+'';
		label=label.replace(/ /gi, "");
		label=label.toUpperCase();


		var sales='';
		if(fs[sales_addr]!==undefined)sales=fs[sales_addr].v+'';
		sales=sales.toUpperCase();


		var imei='';
		if(fs[imei_addr]!==undefined)imei=fs[imei_addr].v+'';
		imei=imei_check(imei);

		
		if(i!=start_row)
			query=query+`,`;
		if(imei=='')
			query=query+`(null,'${model}','${sales}','','${label}','noimei_${model}_${label}','${barcode}')`;
		else
			query=query+`(null,'${model}','${sales}','','${label}','${imei}','${barcode}')`;
		//console.log(model+' '+barcode+' '+label+' '+sales+' '+imei);
		console.log(`(null,'${model}','${sales}','','${label}','${imei}','${barcode}')`);

	}

	query=query+`on duplicate key update model=values(model),sales=values(sales),label=values(label),barcode=values(barcode);`;

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query, function(err, rows, fields) {
	    if (!err){
			res.render('import-excel-file-complete.html');    	
	    	//res.json(rows);
	    }
	    else res.send('fail');
	});	
	connection.end();



    
	
});

function imei_check(imei){
	if(imei.length<15 || imei=="000000000000000")
		return '';
	return imei;
}

function model_name_preprocessing(name){
	var idx=name.indexOf('_')
	if(idx>=0)
	{
		name=name.substring(0,idx);
		return name;
	}else{
		var flag=false;
		for(var i=0;i<name.length;i++)
		{
			if(!flag)
			{
				if(!isNaN(name[i])==true)flag=true;
			}
			else if(flag)
			{
				if(!isNaN(name[i])==false){
					idx=i;break;
				}
			}
		}
		if(idx<0)return name;
		var s=idx;
		var e=name.length;
		var rear=e-s;
		if(rear>2) name=name.substring(0,idx+1);
		return name;
	}
}

app.post('/api/cli/update',function(req,res){
	var nick=req.body.nick.toLowerCase();
	var imei=req.body.imei;
	var model=req.body.model;
	var sales=req.body.sales;

	var query=``;
	if(sales===null || sales=='')
	{
		query=`update phone set model='${model}', nick='${nick}' where imei='${imei}';`;
	}else{
		query=`update phone set model='${model}', nick='${nick}', sales='${sales}' where imei='${imei}';`;
	}
	console.log(query);

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

app.post('/api/cli/update2',function(req,res){
	var nick=req.body.nick.toLowerCase();
	var imei=req.body.imei;
	var id=req.body.id;
	var query=`update phone set nick='${nick}', imei='${imei}' where id=${id};`;

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


app.post('/api/cli/getidbynoimei',function(req,res){
	var model=req.body.model.toUpperCase();
	var query=`select id,label from phone where model='${model}' and imei like '%noimei%';`;
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


app.get('/api/phone/change-model',function(req,res){
	var amodel=req.query.a;
	var bmodel=req.query.b;
	var dest=req.query.dest;
	console.log(amodel+' '+bmodel+' '+dest);
	var query=`update phone set model='${dest}' where model='${amodel}' or model='${bmodel}'`;
	console.log(query);
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
		var data_id=req.body.id || 'NULL';
		var model=req.body.model.toUpperCase();
		var nick=req.body.serial.toLowerCase();
		var sales=req.body.sales.toUpperCase();
		var label=req.body.label;
		if(label!='' && label!=undefined)
			label=label.toUpperCase();
		else label='';
		var barcode=req.body.barcode;
		if(barcode!='' && barcode!=undefined)
			barcode=barcode.toLowerCase();
		else
			barcode='';
		var imei=req.body.imei;
		var email='';
		if(req.body.email!=undefined && req.body.email!='')
		{
			email=req.body.email;
		}

		if(imei=='' || imei=='000000000000000' || imei.length<15 || imei===undefined)
		{
			imei = `concat('noimei_',model,'_',label,'_',floor(rand()*100000))`;
		}
		else
			imei=`'${imei}'`;

		if(barcode===undefined || barcode=='')
		{
			barcode = `concat('nobarcode_',model,'_',label,'_',floor(rand()*100000))`;
		}
		else
			barcode=`'${barcode}'`;


		var device_state=req.body.device_state;
		var to_email=req.body.to_email;
		var from_email=req.body.from_email;
		var device_comment=req.body.device_comment;
		var update_user=req.session.userid;
		if(req.session.userid===undefined && email!='')  
		{
			update_user=`(select id from user where email='${email}')`;
		}
		/*
		var query=`insert into phone
		select * from (select null,'`+model+`','`+sales+`','`+nick+`','`+label+`','${imei}','${barcode}','${device_state}','${to_email}','${from_email}','${device_comment}',${req.session.userid},now()) as tmp
		 where not exists (select nick from phone where nick='${nick}') limit 1`;*/
		 var query=``;

		 /*
		 query=`insert into phone values 
		 (null,'${model}','${sales}','${nick}','${label}',${imei},${barcode},'${device_state}','${to_email}','${from_email}','${device_comment}',${update_user},now())
		 on duplicate key update model=values(model),sales=values(sales),label=values(label),nick=values(nick),imei=values(imei),barcode=values(barcode),last_user=values(last_user),last_dt=values(last_dt);`;
		 */
		 //v1.4.2
		 query=`replace into phone values 
		 (${data_id},'${model}','${sales}','${nick}','${label}',${imei},${barcode},'${device_state}','${to_email}','${from_email}','${device_comment}',${update_user},now())`;

		 /*
		 if(barcode=='')
		 {
		 	query=query.replace(',barcode=values(barcode)','');		
		 }

		if(sales=='')
		{
		  query=query.replace(',sales=values(sales)','');	
		}

		if(label=='')
		{
		 query=query.replace(',label=values(label)','');
		}*/

		console.log(query);
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
	else if(cmd=='mmupdate'){

		var model=req.body.model.toUpperCase();
		var sales=req.body.sales.toUpperCase();
		
		var device_state=req.body.device_state;
		var to_email=req.body.to_email;
		var from_email=req.body.from_email;
		var device_comment=req.body.device_comment;

		var query=`update phone set `;
		if(sales!='')
			query=query+`sales='`+sales+`', `;
		if(device_state!='')
			query=query+`device_state='${device_state}',`;
		if(to_email!='')
			query=query+`to_email='${to_email}',`;
		if(from_email!='')
			query=query+`from_email='${from_email}',`;
		if(device_comment!='')
			query=query+`device_comment='${device_comment}',`;

		query=query+`last_user=${req.session.userid},
		last_dt=now()
		 where model in (${model});`;
		 console.log(query);
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
	else if(cmd=='mupdate'){

		var id=req.body.id;
		var model=req.body.model.toUpperCase();
		var sales=req.body.sales.toUpperCase();
		
		var device_state=req.body.device_state;
		var to_email=req.body.to_email;
		var from_email=req.body.from_email;
		var device_comment=req.body.device_comment;

		var query=`update phone set model='`+model+`',`;
		if(sales!='')
			query=query+`sales='`+sales+`', `;
		if(device_state!='')
			query=query+`device_state='${device_state}',`;
		if(to_email!='')
			query=query+`to_email='${to_email}',`;
		if(from_email!='')
			query=query+`from_email='${from_email}',`;
		if(device_comment!='')
			query=query+`device_comment='${device_comment}',`;

		query=query+`last_user=${req.session.userid},
		last_dt=now()
		 where id in ${id};`;

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
	else if(cmd=='update'){
		var id=req.body.id;
		var model=req.body.model.toUpperCase();
		var nick=req.body.nick.toLowerCase();
		var sales=req.body.sales.toUpperCase();
		var label=req.body.label.toUpperCase();
		var barcode=req.body.barcode.toLowerCase();
		var imei=req.body.imei;

		var device_state=req.body.device_state;
		var to_email=req.body.to_email;
		var from_email=req.body.from_email;
		var device_comment=req.body.device_comment;



		if(imei=='' || imei=='000000000000000' || imei.length<15 || imei===undefined)
		{
			imei = `concat('noimei_',model,'_',label,'_',floor(rand()*100000))`;
		}else{
			imei = `'${imei}'`;
		}

		if(barcode=='' || barcode===undefined)
		{
			barcode = `concat('nobarcode_',model,'_',label,'_',floor(rand()*100000))`;
		}else{
			barcode = `'${barcode}'`;
		}
		var query=`update phone set model='`+model+`', nick='`+nick+`',`
		if(sales!='')
		 	query=query+`sales='${sales}', `;
		query=query+`label='`+label+`',
		barcode=${barcode},
		imei=${imei},
		device_state='${device_state}',
		to_email='${to_email}',
		from_email='${from_email}',
		device_comment='${device_comment}',
		last_user=${req.session.userid},
		last_dt=now()
		 where id=`+id;
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
	else if(cmd=='mmdelete')
	{
		var model=req.body.model.toUpperCase();
		var query=`delete from phone where model in (${model})`;
		console.log(query);
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
	else if(cmd=='mdelete')
	{
		var id=req.body.id;
		var query=`delete from phone where id in ${id}`;
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
	else if(cmd=='delete'){
		var id=req.body.id;
		var query=`delete from phone where id=`+id;
		console.log(query);
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

	}else if(cmd=='check_v2'){

		var s=req.body.serial;
		var imei=req.body.imei;
		var query=`select * from phone where nick like '%${s}%' or imei='${imei}';`;
		var connection = mysql.createConnection(config);
	    connection.connect();
	    connection.query(query, function(err, rows, fields) {

		    if (!err){
		    	if(rows.length==1){
		    		res.json(rows[0]);
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


  var page=req.query.page;
  var search=req.query.search;

  if(page===undefined || page=='')page=1;
  page=parseInt(page);
  var start=(page-1)*10;

   var search_qry=``;
   if(search!=undefined && search!='')
 	 search_qry=`where model like '%${search}%' or sales like '%${search}%' or name like '%${search}%' or label like '%${search}%' or email like '%${search}%' or models like '%${search}%' or saleses like '%${search}%'`;



  var query1=`select * from(
select user.name,user.email,rental.*,phone.model,phone.sales,phone.label,count(*) as cnt,
group_concat(distinct(phone.label)) as labels,
unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models,
group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id group by write_dt order by write_dt desc)K ${search_qry} limit ${start},10;`;


  var query2=`select count(*) as total from(
select user.name,user.email,rental.*,phone.model,phone.sales,phone.label,count(*) as cnt,
group_concat(distinct(phone.label)) as labels,
unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models,
group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id group by write_dt order by write_dt desc)K ${search_qry};`;

 console.log(query1);
  /*var query=`select user.*,rental.*,phone.*,count(*) as cnt,
group_concat(distinct(phone.label)) as labels,
unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models,
group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id group by write_dt order by write_dt desc;`;*/


 	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query1, function(err, rows, fields) {
	    if (!err){

	    	var connection2 = mysql.createConnection(config);
			connection2.connect();
			connection2.query(query2, function(err, rows2, fields) {
			    if (!err){

						res.render('view-rental-pages.html',{user:req.session,rows:rows,menu:'all',timeAgo:timeAgo,rows2:rows2,page:page,search:search});
				}
			    else res.send('fail');
			});	
			connection2.end();
	    }
	    else res.send('fail');
	});	
	connection.end();

});

app.get('/view/rental/pages/my',function(req,res){
  

  if(!logincheck(req,res))return;


  var page=req.query.page;
  var search=req.query.search;

  if(page===undefined || page=='')page=1;
  page=parseInt(page);
  var start=(page-1)*10;

   var search_qry=``;
   if(search!=undefined && search!='')
 	 search_qry=`where model like '%${search}%' or sales like '%${search}%' or name like '%${search}%' or label like '%${search}%' or email like '%${search}%' or models like '%${search}%' or saleses like '%${search}%'`;



var query1=`
  select * from (
select user.name,user.email,rental.*,phone.model,phone.sales,phone.label,count(*) as cnt,group_concat(distinct(phone.label)) as labels,unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models
,group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id 
 and email='${req.session.email}'
  group by write_dt order by write_dt desc)K ${search_qry} limit ${start},10;`;

  var query2=`
  select count(*) as total from (
select user.name,user.email,rental.*,phone.model,phone.sales,phone.label,count(*) as cnt,group_concat(distinct(phone.label)) as labels,unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models
,group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id 
 and email='${req.session.email}'
  group by write_dt order by write_dt desc)K ${search_qry};`;

  /*

  var query2=`select user.*,rental.*,phone.*,count(*) as cnt,group_concat(distinct(phone.label)) as labels,unix_timestamp(write_dt) as ts, group_concat(distinct(model)) as models
,group_concat(distinct(sales)) as saleses
 from user,rental,phone where user_id=user.id and asset_id=phone.id 
 and email='`+req.session.email+`'
  group by write_dt order by write_dt desc;`;*/

	console.log(query1);

	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query1, function(err, rows, fields) {
	    if (!err){

	    	var connection2 = mysql.createConnection(config);
			connection2.connect();
			connection2.query(query2, function(err, rows2, fields) {
			    if (!err){

						res.render('view-rental-pages.html',{user:req.session,rows:rows,menu:'my',timeAgo:timeAgo,rows2:rows2,page:page,search:search});
				}
			    else res.send('fail');
			});	
			connection2.end();
	    }
	    else res.send('fail');
	});	
	connection.end();
	

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

  res.render('view-request-rental.html',{user:req.session});
  return;

////dont need below code.
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

app.post('/api/find/asset/all',function(req,res){
	var uid=req.session.userid;



  var page=req.query.page;
  var search=req.query.search;

  if(page===undefined || page=='')page=1;
  page=parseInt(page);
  var start=(page-1)*10;


  var search_qry=``;
  if(search!=undefined && search!='')
 	search_qry=`where model like '%${search}%' or sales like '%${search}%' or nick like '%${search}%' or label like '%${search}%' or imei like '%${search}%' or barcode like '%${search}%'`;


 var query1=`select * from phone ${search_qry} limit ${start},10;`; 
 var query2=`select count(*) cnt from (select * from phone ${search_qry})K`;
	
/*
	var query1=`select A.*,ifnull(B.state,'return') state from
 (select * from phone) A left join
 (select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id ${search_qry} limit ${start},10;`;


 var query2=`select count(*) as cnt from (
select A.*,ifnull(B.state,'return') state from
 (select * from phone) A left join
 (select asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id)K ${search_qry};`;*/

 	//console.log(query);
 	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query1, function(err, rows, fields) {
	    if (!err){

	    	var connection2 = mysql.createConnection(config);
			connection2.connect();
			connection2.query(query2, function(err, rows2, fields) {
			    if (!err){
			    		var obj={rows:rows,rows2:rows2,page:page,search:search};

						res.json(obj);
				}
			    else res.send('fail');
			});	
			connection2.end();
	    }
	    else res.send('fail');
	});	
	connection.end();
});


app.post('/api/find/asset/user',function(req,res){
	var uid=req.session.userid;
	var state=req.body.state;


	var page=req.query.page;
  var search=req.query.search;

  if(page===undefined || page=='')page=1;
  page=parseInt(page);
  var start=(page-1)*10;


  var search_qry=``;
  if(search!=undefined && search!='')
 	search_qry=`where model like '%${search}%' or sales like '%${search}%' or nick like '%${search}%' or label like '%${search}%' or imei like '%${search}%' or barcode like '%${search}%'`;

//search not working.

 var query1=`select asset_id,user_id,state from rental order by id asc;`;
 //var query2=`select count(*) cnt from (select asset_id from rental r where user_id=${uid} and id=(select max(id) from rental where asset_id=r.asset_id) and state='${state}')K`;


 /*


 	var query1=`select * from (select A.*,ifnull(B.state,'return') state,B.user_id from
 (select * from phone) A left join
 (select user_id,asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id where state='${state}' and user_id=${uid})K ${search_qry} limit ${start},10;`;

 var query2=`select count(*) as cnt from (select A.*,ifnull(B.state,'return') state,B.user_id from
 (select * from phone) A left join
 (select user_id,asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id where state='${state}' and user_id=${uid})K ${search_qry} limit ${start},10;`;*/

	/*var query1=`select A.*,ifnull(B.state,'return') state,B.user_id from
 (select * from phone) A left join
 (select user_id,asset_id,state from rental r where id=(select max(id) from rental group by asset_id having asset_id=r.asset_id)) B
 on A.id=B.asset_id where state='`+state+`' and user_id=`+uid+`;`;*/
 	//console.log(query);
 	
 	var connection = mysql.createConnection(config);
	connection.connect();
	connection.query(query1, function(err, rows, fields) {
	    if (!err){

	    	var assets={};

	    	for(var i=0;i<rows.length;i++){
	    		assets[rows[i].asset_id]={};
	    		assets[rows[i].asset_id].user_id=rows[i].user_id;
	    		assets[rows[i].asset_id].state=rows[i].state;
	    	}
	    	var myassets=[];
	    	var keys=Object.keys(assets);
	    	for(var i=0;i<keys.length;i++)
	    	{
	    		if(uid!=assets[keys[i]].user_id)continue;
	    		if(assets[keys[i]].state!='rental')continue;
	    		var obj={};
	    		obj.state=assets[keys[i]].state;
	    		obj.id=keys[i];
	    		obj.model='_';
	    		obj.sales='_';
	    		obj.nick='_';
	    		obj.label='_';
	    		myassets.push(obj);
	    	}
	    	var pagelist=[];
	    	console.log(myassets.length);
	    	for(var i=(page-1)*10;i<page*10;i++)
	    	{
	    		if(!myassets.length)break;
	    		pagelist.push(myassets[i]);
	    		if(i==myassets.length-1)break;
	    	}
	    	var rows2=[];
	    	rows2.push({cnt:myassets.length});
	    	var obj={rows:pagelist,rows2:rows2,page:page,search:search};

			res.json(obj);
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

	res.render('view-chart.html',{user:req.session,randomColor:randomColor});
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