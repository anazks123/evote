var express = require('express');
var router = express.Router();
var con=require('../config/config');

/* GET users listing. */
router.get('/register', function(req, res, next) {
 
  res.render('admin/login')
});

router.get('/home', function(req, res, next) {
  var user = req.session.user ;
  var data = req.session.candidates;
      res.render('admin/home',{user,data})
  
  
});

router.post('/login',(req,res)=>{
  var username = "admin@123"
  var pass = 123;
  var admin = {
    mailid :"admin@123",
     pass : 123
  }
  if(req.body.user == username && req.body.password == pass ){
      req.session.user = admin;
      var sql = "select * from candidates"
      con.query(sql,(err,row)=>{
        if(err){
          console.log(err)
        }else{
          req.session.candidates=row;
          res.redirect('/admin/home')
        }
      })
   
  }else{
    res.render('admin/login',{data:true})
  }
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})


router.post('/addCandidates',(req,res)=>{
console.log("hi")
var image_name;
if(!req.files) return res.status(400).send("no files were uploaded.");
var file=req.files.img;
var image_name = file.name;
let sql="INSERT INTO candidates SET ?";
console.log(file)
console.log(image_name);
if(file.mimetype =="image/jpeg" || file.mimetype =="image/png" || file.mimetype =="image/gif"
){
  file.mv("public/images/candidats/"+file.name,function(err){
    if(err) return res.status(500).send(err);
    console.log(image_name);

let data={
 
  name:req.body.name,
  age:req.body.age,
  place:req.body.place,
  img:image_name,
  Area:req.body.Area,
  party:req.body.party
}; 
console.log(data)
con.query(sql,data,(err,result)=>{
  if(err){
    console.log(err)
  }else{
    res.redirect('/admin/home')
  }
})
}) 
} 
})
module.exports = router;
