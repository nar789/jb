//0-1. header
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);


//0-2. router
app.get('/intro',function(req,res) {
  res.send('JzencBuwo proj. designed by jh0511.lee. This is help for managing assets.');
});

app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/m1',function(req,res){
  res.sendFile(__dirname + '/m1.html');
});


app.use(express.static(__dirname + '/'));


//1. enetry point
http.listen(2323,function(){
  init();
  console.log('JB Server listen on *:2323');
});

function init(){

}