
var express = require('express');
var con=require('../config/config')
var router = express.Router();
var nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const async = require('hbs/lib/async');

var message = "";
/* GET home page. */
router.get('/',(req,res)=>{
  res.render('index')
})

router.get('/home', function(req, res, next) {
  var user=req.session.user;
 
  var user = req.session.user ;
  sql =" select * from candidates"
  con.query(sql,(err,data)=>{
    if(err){
      console.log(err)
    }else{
      console.log(data)
      res.render('home', {user,data,message});
    }
  })
 
});

router.get('/register',function(req,res){
  res.render('regstr')
})
router.get('/login',function(req,res){
  res.render('login')
})
router.post('/registerr', async(req,res)=>{
  console.log(req.body);
  var data=req.body;
  var encPass;
  var password = req.body.password;
// await  bcrypt.hash(10, function(err,salt){
    bcrypt.hash(password,10,function(err,hash){
      if(err){
        console.log(err)
      }else{
        data.password=hash;
        console.log(data)
        var sql="insert into register set ?"
        con.query(sql,data,(err,result)=>{
        if(err){
          console.log(err)
        }else{
          console.log("successfully inserted")
          res.redirect('/')
        }
 })
      }
    })
  // })

})
router.post('/login',async(req,res)=>{
  console.log(req.body);
  var Aadhar=req.body.aadhar;
  var pass=req.body.password;
  var sql="select * from register where aadhar=?"
  await con.query(sql,[Aadhar], async(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      if(result.length > 0){
        console.log("user Exist")

            var password= result[0].password;
            console.log(password)
            console.log(pass)
            let correctPass = await bcrypt.compare(password,pass)
            console.log(correctPass)
            if(correctPass){
              console.log("passwrd--")
              console.log(correctPass)
              res.redirect('/home')
            }else{
              
              res.render('login',{data:true})
              console.log("login error")
              
            }
            
          }else{
            res.render('login',{data:true})
            console.log("login error")
      }
    }
  })
})
router.get('/voting',function(req,res){
  res.render('cart')
})

router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/')
})
router.get('/voteNow/:id',function(req,res){
    var id =  req.params.id;
    var userid = req.session.user.id;
    var user = req.session.user;
    var sql2 = "select * from voted where Userid = ?"
    con.query(sql2,[userid],(err,row)=>{
      if(err){
        console.log(err)
      }else{
        if(row.length>0){
          message = "Already Voted"
          res.redirect('/home')
          console.log("voted")
        }else{

          var message = `http://localhost:4000/confirmVote/${id}`
          let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              //althafhussain816@gmail.com
              user: 'greencartkottayam@gmail.com',
                  pass: 'ashwinbabu@123',
            },
            tls:{
              rejectUnauthorized : false,
            },
          });
          let mailOptions = {
            from: 'OnlineVoting Team',
            to: req.session.user.mailid,
            subject: 'Invitation',
            text: message
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              res.render('male',{user})
            }
          });
        }
      }
    })
    
})
router.get('/confirmVote/:id',(req,res)=>{
  var id = req.params.id;
  var user = req.session.user;
  var sql = "Select * from candidates where id  = ?"
  con.query(sql,[id],(err,result)=>{
    if(err){
      console.log(err)
    }else{
      var data = result[0]
      res.render('confirmVote',{data,user})
    }
  })
})
router.get('/CvoteNow/:id/:name',(req,res)=>{
  var id  = req.params.id;
  var name  = req.params.name;
  var user = req.session.user;
  var votingData = {
    id,
    name
  }
  
  var message = `thank you for using our service`
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      //althafhussain816@gmail.com
      user: 'greencartkottayam@gmail.com',
          pass: 'ashwinbabu@123',
    },
    tls:{
      rejectUnauthorized : false,
    },
  });
  let mailOptions = {
    from: 'OnlineVoting Team',
    to: req.session.user.mailid,
    subject: 'Invitation',
    text: message
  };
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      var sql = "insert into voted set ?"
      var data = {
        userMale : req.session.user.mailid,
        Userid :req.session.user.id,
        candidateId:id,
        name:name
      }
      req.session.vote = data;
      res.render('qr',{user})
     }
  });
})
router.get('/myvotes',(req,res)=>{
  var sql ="select * from voted where userid = ?"
  var id = req.session.user.id;
  con.query(sql,[id],(err,result)=>{
    if(err){
      console.log(err)
    }else{
      var user = req.session.user;
      res.render('myVotes',{result,user})
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/login')
})

router.get('/QrVote',(req,res)=>{
  console.log(res.session.vote)
      res.render('qr')
  
})
router.post('/voteFinal',(req,res)=>{
  var data = req.session.vote
  var adhar = req.session.user.aadhar;
  var adharId= req.body.adhar;
  if(adharId==adhar){
    console.log(data)
  var sql ="insert into voted set ?"
  con.query(sql,data,(err,result)=>{
    if(err){
      console.log(err)
    }else{

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          //althafhussain816@gmail.com
          user: 'greencartkottayam@gmail.com',
              pass: 'ashwinbabu@123',
        },
        tls:{
          rejectUnauthorized : false,
        },
      });
      let mailOptions = {
        from: 'OnlineVoting Team',
        to: req.session.user.mailid,
        subject: 'Invitation',
        text: "thank you for using our Service"
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
       
       res.redirect('/home')
         }
      });



    }
  })
  }else{
      res.redirect('/invalidQR')
  }
  
})
router.get('/invalidQR',(req,res)=>{
  res.render('invalidQR',{h:true})
  })
router.get('/qrGen',(req,res)=>{
res.render('qrGenarator',{h:true})
})
router.get('/loader',(req,res)=>{
  res.render('loader',{h:true})
  })
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
module.exports = router;
