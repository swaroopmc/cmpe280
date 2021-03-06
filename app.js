var express = require('express');
var path = require('path');
var crypto = require('crypto');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
var util = require('util');
var fs       = require('fs');
var path = require('path');
//var multipart = require('connect-multiparty');
//var multipartMiddleware = multipart();
var multer  = require('multer')
var upload = multer({ dest: './uploads/' })
var busboy = require('connect-busboy');
 var fileupload = require('fileupload').createFileUpload('/uploads').middleware





var app = express();
var mongoOp =require("./model/mongo");


//app.use(fileUpload());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'uploads')));


app.set('view engine', 'ejs');

//GET user dashboard page
app.get('/', function(req, res, next) {
	res.render('dashboard', { title: ' Dashboard' });
});


/*app.get("/", function(req,res){
        var response = {};
        res.sendFile(path.join(__dirname + '/views/itemsDashboard.ejs'));
    });*/

//GET item --swaroop
app.get('/itemDetail', function(req, res, next) {
    res.render('itemDetail', { title: ' Item' });
});


app.get("/items/category/:cat", function(req,res){

        var response = {};     

        var category = req.params.cat;
        console.log('category provided is nodejs' + category);
        mongoOp.find({'category': category },function(err,data){
        
            if(err) {
                response = {"message" : "Error fetching data"};
            } else {
                response = {"message" : data};
            }
            res.json(response);
        });

    
    });

app.get("/items/search/:searchItem", function(req,res){

        var response = {};     

        var searchItem = req.params.searchItem;
        console.log('search item provided in nodejs is'  + searchItem);
        var exp = new RegExp(searchItem);
        console.log(exp);
        mongoOp.find({ 'heading': { $regex:exp} } ,function(err,data){
        
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = {"error" : false,"message" : data};
            }
            res.json(response);
        });

    
    });



app.post("/sellItems/",upload.single('pic'),function(req, res,next){
    console.log('file info: ',req.files);
    console.log("post");
    var db = new mongoOp();
    
    for(var key in req.body){
            console.log(key+" value is"+req.body[key]);
            db[key] = req.body[key];
    }
    console.log("Categor"+req.body['category']);
            var currentDate = new Date();
            var date = (currentDate.getMonth()+1) +'/'+currentDate.getDate()+'/'+currentDate.getFullYear();
            db["date"] = date;
    
    
    console.log("Id is"+db._id);
    /**
    db.title = req.body['title'];
    db.name =req.body['name'];
    db.email =req.body['email'];
    db.phone =req.body['phone'];
    db.desc =req.body['desc'];
    db.price =req.body['price'];
    db.location =req.body['location'];
    db.pick =req.body['pick'];
    **/
    if(req.file)
        db.itemImageURL = req.file.path;
    console.log(JSON.stringify(db));    
    var response = {};
        
    db.save(function(err){
        
    if(err) {
          response = {"error" : true,"message" : "Error adding data"};
    } else {
                response = {"error" : false,"message" : "Data added"};
        }
         //   res.json(response);
           // res.redirect('sellItems/'+db._id);
              res.redirect('/');
   });

});


app.get("/sellItems/:itemId", function(req,res){
        var response = {};
        //var _id = req.params.id;
	    console.log("For email"+req.params.emailId);
        Item.findOne({'_id':req.params.itemId},function(err,data){
        // Mongo command to fetch all data from collection.
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = {"error" : false,"message" : data};
            }

            
            res.send(data);
        });
    });



//Swaroop
app.get("/items", function(req,res){

        var response = {};


        if(!req.param('q')) {

       mongoOp.find({},function(err,data){
    
            if(err) {
                response = {"message" : "Error fetching data"};
            } else {
                response = data;
            }
            res.json(response);
        });


      }

      

else{
        var u = req.param('q');
       console.log(u);
        mongoOp.find({'_id': u },function(err,data){
        
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = data;
            }
            res.json(response);
        });
   }




    
    });






app.post("/items/postforsale",function(req,res){
	    console.log("post");
        var db = new Item();
        var response = {};
        //var user = req.param('user');
        db.itemId = req.body.itemId;
        db.itemName = req.body.itemName;
        db.price = req.body.price;
        db.category = req.body.category ; 
        db.itemImageURL = req.body.itemImageURL

        db.save(function(err){
        
            if(err) {
                response = {"error" : true,"message" : "Error adding data"};
            } else {
                response = {"error" : false,"message" : "Data added"};
            }
            res.json(response);
        });
    });







app.delete("/items/:itemId", function(req,res){
  var response ={}
  Item.findOneAndRemove({'itemId':req.params.itemId}, function (err, data) {  
  
response = {
        message: "successfully deleted",
      
    };
    res.send(response);
});
});





 
app.put("/items/:itemId", function(req,res){

Item.findOne({'itemId':req.params.itemId}, function (err, data) {  
    // Handle any possible database errors
    if (err) {
        res.status(500).send(err);
    } else {

    
   data.itemName = req.body.itemName || data.itemName;
    data.price = req.body.price || data.price;
    data.itemImageURL = req.body.itemImageURL || data.itemImageURL;
    data.category = req.body.category || data.category;

        
      data.save(function (err, data) {
            if (err) {
                res.status(500).send(err)
            }
            res.send(data);
        });// save
    }
}); // find

}); //put


app.listen(3001);
console.log("the server is runnning");


module.exports = app;