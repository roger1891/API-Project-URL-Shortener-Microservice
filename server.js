'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var UrlModel = require(__dirname + "/Url.model");
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use("/", bodyParser.urlencoded({extended: false}));


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

/***my code***/
//UrlModel.count({},(err,count)=>number = count);

let callBackNew = (req, res)=> {
  var link = req.body.url;
  //create db data
  var urlModel = new UrlModel({
    original_url: link,
    short_url: 1
  });
  
  //count model function
  UrlModel.count({},(err,count)=> {  
    //regex pattern
    var regexPat = /^https?:\/\/[\w./]+/gi;
    
    //update short url based on database content count
    (err)? console.log("problem counting items items in db: " + err): urlModel.short_url = count;
    
    //create link without https for dns lookup
    var removeHttpsFromLink = link.replace(regexPat,"");
    
    //lookup if dns exists
    dns.lookup(removeHttpsFromLink, function (err, address, family) {
      if(err)
      {
        res.json({"error" : "URL doesn't seem to exist" + err});
      }
      else if(address != "undefined")
      {
        //store in database if link has https or https
        if(regexPat.test(link)){
          //store in database
          urlModel.save((err, data)=>{    
            (err)? res.json({"error" : "problem saving to db: " + err}): res.json(data);
          });  
        }
        else
        {
          res.json({"error":"invalid URL. Needs to have http or https//link"});
        }        
      }
    });
  });

  
 
};

//add new url via post
app.post("/api/shorturl/new", callBackNew);


//get all items from database callBack
var callBackAll = (req, res)=> {
  UrlModel.find({}, (err,data)=> {
    (err)? res.json({"error":err}): res.json(data);    
  });
};

//view all entries from database
app.get("/api/shorturl/all", callBackAll)

//display specific short urls
var callBackNumber = (req, res) => {
  //save number from url
  var shortUrlNumber = req.params.number;
  //short url object
  var jsonObject = {short_url : shortUrlNumber};
  //search for short url
  UrlModel.findOne(jsonObject, (err, data) => {
      console.log(data);
      //redirect to url
      res.redirect(data.original_url);
  });
};

//view short urls in database
app.get("/api/shorturl/:number", callBackNumber);
/***my code***/

//listen to port
app.listen(port, function () {
  console.log('Node.js listening ...');
  
//check whether mongo database is connected or not  
mongoose.connection.on('open', function (ref) {
  console.log('Connected to mongo server. ' +mongoose.connection.readyState);
});
mongoose.connection.on('error', function (err) {
  console.log('Could not connect to mongo server! ' + mongoose.connection.readyState);
  console.log(err); 
});

});