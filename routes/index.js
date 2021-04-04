var express = require('express');
var router = express.Router();
const {ensureAuthenticated} = require('../config/auth')
const {ensureAuthenticate} = require('../config/auths')
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail')
// var Client = require('coinbase').Client;

var coinbase = require('coinbase-commerce-node');
var Checkout = coinbase.resources.Checkout;
var Charge = coinbase.resources.Charge;
var Client = coinbase.Client;

// Client.init('8b022ed3-0223-442d-ba9b-afa06cb59e45');
Client.init('16784c1c-61fe-4a73-be61-595e0ed4341e');


var multer = require('multer')
const path = require('path');

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
 
var upload = multer({ storage: storage })

const passport = require('passport');
var randomstring = require("randomstring");
const nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport({
        host: 'premium-mining.com',
        port: 465,
        secure: true, //this is true as port is 465
        auth: {
            user: 'support@premium-mining.com',
            pass: 'Catherine141$'
        },
    }),
    EmailTemplate = require('email-templates').EmailTemplate,
    Promise = require('bluebird');


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });


router.get('/ref/:username', (req,res)=>{
    var g = req.params.username
    res.render('register2', {
        "refferal" : g 
    });
})

router.get('/buy-bitcoin', (req,res)=>{
    res.redirect('https://www.tidio.com/talk/tezqwgyqkbzuiirshrnsdlcxiswjuzoy')
})

router.get('/recover', (req,res)=>{
    if (req.user) {
        
        res.redirect('/')
    }
    else {
        
        res.render('recover'); 
    }
         

})

router.post('/recover1', (req,res)=>{
    var email = req.body.email
    var password = req.body.password
    
    if (email === '' || password === '') {
        res.json({
           confirmation: "failed",
           data: "Please fill in all details"
        })
    }
    else {
        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(password, salt, function(err, hash){
                if(err){
                  console,log(err);
                }
                else {
                   var password = hash;
        
                    var db = req.db
        
                    var collection = db.get('users')
        
                    collection.update({"email":email},{$set:{"password":password}},function(e,docs){
                        if (docs.n === 1) {
                            res.json({
                               confirmation: "success",
                               data: "Password Changed successfully"
                            })
                        }
                        else {
                            res.json({
                               confirmation: "failed",
                               data: "Error occurred while updating password"
                            })
                        }
                    }) 
                }
            })
        })
    }
    
})

router.post('/recover', (req,res)=>{
    const email = req.body.email

    if(email === '') {
        res.json({
            confirmation: "failed",
            data: "Please Input Email Address"
        })
    }
    else {
        var db = req.db;
        var collection = db.get('users');
        
        collection.find({"email":email},function(e,docs){
            if (e) {
                console.log(e)
            }
            if (docs.length < 1) {
                res.json({
                    confirmation: "failed",
                    data: "Error! PLease check email and try again"
                })
            }
            else {
                // var permalink = email.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();

                var verification_token = randomstring.generate({
                    length: 8
                });
                
                var db = req.db;
                var collection = db.get('users');

                collection.update({"email":email},{$set:{"verificationtoken1": verification_token}},function(e,doc){
                    if (e) {
                        console.log(e)
                    }
                    if (doc.n === 1) {
                        sgMail.setApiKey('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')
                        const msg = {
                          to: email, // Change to your recipient
                          from: 'info@topbarns.com', // Change to your verified sender
                          subject: 'New signup',
                          text: 'Hi Singer',
                          html: '<h4>Hello ' + docs[0].username + ',</h4><div><p>You just requested a password reset on premium-mining.</p><p>Please use the code provided below to verify your account</p><p><strong>' + verification_token + '</p><p>Contact us immediately if you did not authorize this. Thank you</p></div>',
                        }
                        sgMail
                          .send(msg)
                          .then(() => {
                            // console.log('Email sent')
                            res.json({
                                confirmation: "success",
                                data: docs[0].username
                            })
                          })
                          .catch((error) => {
                            console.error(error)
                          })
                    }
                    else {
                        res.json({
                            confirmation: "failed",
                            data: "An Error occurred please try again"
                        })
                        return
                    }
                })
            }
        })
    }
})

router.post('/resendverify',(req,res)=>{
    var body = req.body
    const username = body.username

    var db = req.db
    var collection = db.get('users')

    collection.find({"username":username}, function (err, doc) {
        if (err) {
            console.log(err)
        }
        if (doc == '') {
            console.log('user not registered')
        }
        else {
            var vcode = doc[0].verificationtoken
            var email = doc[0].email
            var username = doc[0].username

            sgMail.setApiKey('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')
            const msg = {
              to: email, // Change to your recipient
              from: 'info@topbarns.com', // Change to your verified sender
              subject: 'New signup',
              text: 'Hi Singer',
              html: '<h4>Hello ' + username + ',</h4><div><p>Thank you for registering on premium-mining.</p><p>Please use the code provided below to verify your account</p><p><strong>' + vcode + '</p><p>Contact us immediately if you did not authorize this registration. Thank you</p></div>',
            }
            sgMail
              .send(msg)
              .then(() => {
                // console.log('Email sent')
                res.json({
                    confirmation: "success",
                    data: "code sent successfullly"
                })
              })
              .catch((error) => {
                console.error(error)
              })
        }
    })
})

router.post('/resendrec',(req,res)=>{
    var body = req.body
    const username = body.username

    var db = req.db
    var collection = db.get('users')

    collection.find({"username":username}, function (err, doc) {
        if (err) {
            console.log(err)
        }
        if (doc == '') {
            console.log('user not registered')
        }
        else {
            var vcode = doc[0].verificationtoken1
            var email = doc[0].email
            var username = doc[0].username

            sgMail.setApiKey('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')
            const msg = {
              to: email, // Change to your recipient
              from: 'info@topbarns.com', // Change to your verified sender
              subject: 'New signup',
              text: 'Hi Singer',
              html: '<h4>Hello ' + username + ',</h4><div><p>Thank you for registering on premium-mining.</p><p>Please use the code provided below to verify your account</p><p><strong>' + vcode + '</p><p>Contact us immediately if you did not authorize this registration. Thank you</p></div>',
            }
            sgMail
              .send(msg)
              .then(() => {
                // console.log('Email sent')
                res.json({
                    confirmation: "success",
                    data: "code sent successfullly"
                })
              })
              .catch((error) => {
                console.error(error)
              })
        }
    })
})

router.post('/verifyaccount',(req,res)=>{
    var body = req.body
    const username = body.username
    const code = body.code

    var db = req.db
    var collection = db.get('users')

    collection.find({"username":username}, function (err, doc) {
        if (err) {
            console.log(err)
        }
        if (doc == '') {
            console.log('user not registered')
        }
        else {
            var vcode = doc[0].verificationtoken
            // console.log(vcode)
            // console.log(code)
            if (vcode !== code) {
                // console.log('wrong code')
                res.json({
                    confirmation: "failed",
                    data: "wrong code"
                })
            }
            else {
                var db = req.db
                var collection = db.get('users')

                collection.update({"username":username}, {$set:{"verification":true}}, function (err, doc) {
                    if (err) {
                        console.log(err)
                    }
                    if (doc.n === 1) {
                        // console.log('user verified successfullly')
                        res.json({
                            confirmation: "success",
                            data: "user verified successfullly"
                        })
                    }
                })
            }
        }
    })
})

router.post('/verifyrec',(req,res)=>{
    var body = req.body
    const username = body.username
    const code = body.code
    const password = body.password

    if (password == '' || code == '') {
        res.json({
            confirmation: "failed",
            data: "Please fill in all details"
        })
    }

    else {
        var db = req.db
        var collection = db.get('users')

        collection.find({"username":username}, function (err, doc) {
            if (err) {
                console.log(err)
            }
            if (doc == '') {
                console.log('user not registered')
            }
            else {
                var vcode = doc[0].verificationtoken1
                console.log(vcode)
                console.log(code)
                if (vcode !== code) {
                    // console.log('wrong code')
                    res.json({
                        confirmation: "failed",
                        data: "wrong code"
                    })
                }
                else {
                    bcrypt.genSalt(10, function(err, salt){
                        bcrypt.hash(password, salt, function(err, hash){
                            if(err){
                              console.log(err);
                            }
                            else {
                               var password = hash;
                    
                                var db = req.db
                    
                                var collection = db.get('users')
                    
                                collection.update({"username":username},{$set:{"password":password}},function(e,docs){
                                    if (docs.n === 1) {
                                        res.json({
                                           confirmation: "success",
                                           data: "Password Changed successfully"
                                        })
                                    }
                                    else {
                                        res.json({
                                           confirmation: "failed",
                                           data: "Error occurred while updating password"
                                        })
                                    }
                                }) 
                            }
                        })
                    })
                }
            }
        })
    }
})

router.post('/pp',ensureAuthenticated,upload.single('image'),(req,res)=>{
    const email = req.session.passport.user
    var db = req.db
    var file = req.file.path
    var image = file.substr(7, 32)
  
    var collection = db.get('users')
    
    // res.json(image)
    
    collection.update({"email":email},{$set:{"profilepicture":image}}, function (err, doc){
        if (err) {
            console.log(err)
        }
        if (doc) {
            res.redirect('/edit')
        }
    })
})

router.get('/recverify/rec/:username', (req,res)=>{
    var username = req.params.username

    res.render('recverify', {
        "username": username
    })
})

router.get('/regsuccess/:username', (req,res)=>{
    var username = req.params.username

    res.render('regsuccess', {
        "username": username
    })
})

router.get('/logout',ensureAuthenticated, (req,res)=>{
    const email = req.session.passport.user
    
    var db = req.db;
    
    var collection = db.get('users');
    
    collection.update({"email":email}, {$set:{"loggedin":false}}, function(err, doc) {
        if (doc.n === 1) {
            req.logout();
            req.flash('success_msg','Now logged out');
            req.session.destroy();
        
            res.redirect('/login');
        }
        else {
             res.redirect('/')
        }
    })
})

router.get('/verify/:permalink/:vt/', (req,res)=>{
    // res.send('working')
    var vt = req.params.vt
    var permalink = req.params.permalink
        
    var db = req.db;
    var collection = db.get('users');
    
    collection.find({"emailpermalink":permalink}, function (err, doc) {
        if (err) {
            console.log(err)
        }
        if (doc[0].emailpermalink === permalink && doc[0].verificationtoken === vt) {
            var db = req.db;
            var collection = db.get('users');
            
            collection.update({"emailpermalink":permalink}, {$set:{"verification":true}}, function (err,doc) {
                if (err) {
                    console.log(err)
                }
                if (doc.n === 1) {
                    res.redirect('/login')
                }
            })
        }
        else {
            res.send('Please retry the whole process again')
        }
    })
})


router.post('/charge',ensureAuthenticated, function (req, res) {
    const email = req.session.passport.user
    var amount = req.body.amount
    
    if (amount === '' || amount === '0') {
        res.json({
            confirmation: "failed",
            data: "Please input an amount greater than 0"
        })
        return
    }
    else {
        var db = req.db 

        var collection = db.get('bitcointrans')
        
        collection.find({"email":email}, function (err, doc) {
            if (doc.length < 1) {
                var chargeData = {
                    'name': 'Deposit Funds',
                    'description': 'Deposit funds into your premium-mining account wallet',
                    'local_price': {
                        'amount': amount,
                        'currency': 'USD'
                    },
                    "metadata": {
                         "customer_email": email
                      },
                    'pricing_type': 'fixed_price',
                    'redirect_url': 'https://ap.premium-mining.com/',
                    'cancel_url': 'https://ap.premium-mining.com'
                
                }
                
                Charge.create(chargeData, function (error, response) {
                  if (error) {
                      console.log(error)
                  }
                  if (response && response.id) {
                        var db = req.db 
            
                        var collection = db.get('bitcointrans')
                        
                        collection.insert({
                            "email": email,
                            "responseid": response.code
                        }, function (err, doc) {
                            if (err) {
                                console.log(err)
                            }
                            if (doc) {
                                res.json({
                                    confirmation: "success",
                                    data: response.hosted_url
                                })
                                
                                return
                            }
                        })
                  }
                  
                })
            }
            else {
                var db = req.db 
            
                var collection = db.get('bitcointrans')
                
                collection.remove({"email":email}, function (err, doc) {
                    if (err) {
                        res.json(err)
                    }
                    if (doc.result.n === 1) {
                        var chargeData = {
                            'name': 'Deposit Funds',
                            'description': 'Deposit funds into your premium-mining account wallet',
                            'local_price': {
                                'amount': amount,
                                'currency': 'USD'
                            },
                            "metadata": {
                                 "customer_email": email
                              },
                            'pricing_type': 'fixed_price',
                            'redirect_url': 'https://ap.premium-mining.com/',
                            'cancel_url': 'https://ap.premium-mining.com'
                        
                        }
                        
                        Charge.create(chargeData, function (error, response) {
                          if (error) {
                              console.log(error)
                          }
                          if (response && response.id) {
                                var db = req.db 
                    
                                var collection = db.get('bitcointrans')
                                
                                collection.insert({
                                    "email": email,
                                    "responseid": response.code
                                }, function (err, doc) {
                                    if (err) {
                                        res.json(err)
                                    }
                                    if (doc) {
                                        res.json({
                                            confirmation: "success",
                                            data: response.hosted_url
                                        })
                                        
                                        return
                                    }
                                })
                          }
                          
                        })
                    }
                    else {
                        res.send('error')
                    }
                })
            }
            
            
        })
    }
    
    
})

router.get('/edit',ensureAuthenticated, function(req, res, next){
    const email = req.session.passport.user

    var db = req.db

    var collection = db.get('users')

    collection.find({"email":email},function(e,docs){

        if (e) {
            res.json(e)
        }
        else {
            var str = (docs[0].date+"")

            res.render('editaccount', {
                "username" : docs[0].username,
                "firstname" : docs[0].firstname,
                "lastname" : docs[0].lastname,
                "referral" : docs[0].referral,
                "referrallink" : docs[0].referrallink,
                "email" : docs[0].email,
                "profilepicture" : docs[0].profilepicture,
                "date" : str
            });
        }
    })
})

router.get('/referrals',ensureAuthenticated, function(req, res, next){
    const email = req.session.passport.user

    var db = req.db

    var collection = db.get('users')

    collection.find({"email":email},function(e,docs){

        if (docs == '') {
            console.log('no record found')
        }
        if (e) {
            res.json(e)
        }
        else {
            var db = req.db

            var collection = db.get(email)

            var username = docs[0].username

            collection.find({"name":"refference"},{"email": email}, function(e,docss){
                if (docss) {
                    // res.json(docss)
                    res.render('referrals', {
                        "username" : docs[0].username,
                        "referrallink" : docs[0].referrallink,
                        "refferrence" : docs[0].refferrence,
                        "referralearning" : docs[0].referralearning,
                        "profilepicture" : docs[0].profilepicture,
                        "docs" : docss
                    });
                }
            })
            
        }
    })
})


router.get('/',ensureAuthenticated, function(req, res) {
	const email = req.session.passport.user 
	
	var db = req.db

    var collection = db.get('users')
    
    collection.find({"email":email}, function(err, doc) {
        if (err) {
            console.log(err)
        }
        if (doc[0].investment === 0) {
            var db = req.db

            var collection = db.get('bitcointrans')
            
            collection.find({"email":email}, function (err, doc) {
                if (err) {
                    res.json(err)
                }
                if (doc.length < 1) {
                    var db = req.db
        
                    var collection = db.get(email)
                
                    collection.find({"email":email}, function (err, docs) {
                    	if (err) {
                    		condole.log(err)
                    	}
                    	if (docs) {
                    	    var db = req.db
                
                            var collection = db.get('users')
                
                            collection.find({"email":email}, function (err, docss) {
                                if (err) {
                                    console.log(err)
                                }
                                if (docss) {
                                    res.render('index', {
                                        "docs": docs,
                                        "username": docss[0].username,
                                        "balance": docss[0].balance,
                                        "profit": docss[0].profit,
                                        "refference": docss[0].refference,
                                        "totaldeposit": docss[0].totaldeposit,
                                        "totalwithdrawal": docss[0].totalwithdrawal,
                                        "totalinvestment": docss[0].totalinvestment,
                                        "profilepicture" : docss[0].profilepicture
                                    })
                                }
                            })
                    	}
                    })
                }
                else {
                   Charge.retrieve(doc[0].responseid, function (error, response) {
                        if (error) {
                            res.json(error)
                        }
                        
                        if (response.payments.length < 1) {
                            var db = req.db
        
                            var collection = db.get(email)
                        
                            collection.find({"email":email}, function (err, docs) {
                            	if (err) {
                            		condole.log(err)
                            	}
                            	if (docs) {
                            	    var db = req.db
                        
                                    var collection = db.get('users')
                        
                                    collection.find({"email":email}, function (err, docss) {
                                        if (err) {
                                            console.log(err)
                                        }
                                        if (docss) {
                                            res.render('index', {
                                                "docs": docs,
                                                "username": docss[0].username,
                                                "balance": docss[0].balance,
                                                "profit": docss[0].profit,
                                                "refference": docss[0].refference,
                                                "totaldeposit": docss[0].totaldeposit,
                                                "totalwithdrawal": docss[0].totalwithdrawal,
                                                "totalinvestment": docss[0].totalinvestment,
                                                "profilepicture" : docss[0].profilepicture
                                            })
                                        }
                                    })
                            	}
                            })
                        }
                        
                        else {
                            
                                var db = req.db 
        
                                var collection = db.get('users')
                                
                                collection.find({"email":email}, function(err, doc) {
                                    if (err) {
                                        console.log(err)
                                    }
                                    if (doc) {
                                        var balance = JSON.parse(doc[0].balance) + JSON.parse(response.payments[0].value.local.amount)
                                        var totaldeposit = JSON.parse(doc[0].totaldeposit) + JSON.parse(response.payments[0].value.local.amount)
                                        var totaldeposit1 = totaldeposit.toFixed(2)
                                        var balance1 = balance.toFixed(2)

                                        var db = req.db 
                            
                                        var collection = db.get('users')
                                        
                                        collection.update({"email":email}, {$set:{"balance":balance1, "totaldeposit":totaldeposit1}}, function (err, doc) {
                                            if (err) {
                                                console.log(err)
                                            }
                                            if (doc.n === 1) {
                                                var db = req.db 
                            
                                                var collection = db.get(email)
                                                
                                                collection.insert({
                                                    "name":"Coin Deposit",
                                                    "amount": response.payments[0].value.local.amount,
                                                    "type": "deposit",
                                                    "status": "success",
                                                    "statusc": "text-success",
                                                    "date": new Date(),
                                                    "email": email
                                                }, function(err, doc) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                    if (doc) {
                                                        var db = req.db 
                            
                                                        var collection = db.get('admint')
                                                        
                                                        collection.insert({
                                                            "name":"Coin Deposit",
                                                            "amount": response.payments[0].value.local.amount,
                                                            "status": "success",
                                                            "type": "deposit",
                                                            "statusc": "text-success",
                                                            "date": new Date(),
                                                            "email": email
                                                        }, function(err, doc) {
                                                            if (err) {
                                                                console.log(err)
                                                            }
                                                            if (doc) {
                                                                var db = req.db 
                            
                                                                var collection = db.get('bitcointrans')
                                                                
                                                                collection.remove({"email":email}, function(err, doc) {
                                                                    if (err) {
                                                                        console.log(err)
                                                                    }
                                                                    if (doc.result.n === 1) {
                                                                        var db = req.db
        
                                                                        var collection = db.get(email)
                                                                    
                                                                        collection.find({"email":email}, function (err, docs) {
                                                                        	if (err) {
                                                                        		condole.log(err)
                                                                        	}
                                                                        	if (docs) {
                                                                        	    var db = req.db
                                                                    
                                                                                var collection = db.get('users')
                                                                    
                                                                                collection.find({"email":email}, function (err, docss) {
                                                                                    if (err) {
                                                                                        console.log(err)
                                                                                    }
                                                                                    if (docss) {
                                                                                        res.render('index', {
                                                                                            "docs": docs,
                                                                                            "username": docss[0].username,
                                                                                            "balance": docss[0].balance,
                                                                                            "profit": docss[0].profit,
                                                                                            "refference": docss[0].refference,
                                                                                            "totaldeposit": docss[0].totaldeposit,
                                                                                            "totalwithdrawal": docss[0].totalwithdrawal,
                                                                                            "totalinvestment": docss[0].totalinvestment,
                                                                                            "profilepicture" : docss[0].profilepicture
                                                                                        })
                                                                                    }
                                                                                })
                                                                        	}
                                                                        })
                                                                    }
                                                                    else {
                                                                        console.log('error')
                                                                    }
                                                                })
                                                            }
                                                        })
                                                        
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                            
                        
                        
                    }); 
                }
            })
        }
        else {
            var d = new Date()
            var n = d.getTime()
            
            var db = req.db

            var collection = db.get('users')
            
            collection.find({"email":email}, function (err, doc) {
                if (err) {
                    console.log(err)
                }
                if (n >= doc[0].time) {
                    var db = req.db

                    var collection = db.get('users')
                    
                    collection.update({"email":email}, {$set:{"balance":doc[0].balance1, "investment":0}}, function (err, docs) {
                        if (err) {
                            console.log(err)
                        }
                        if (docs.n === 1) {
                            var db = req.db

                            var collection = db.get('bitcointrans')
                            
                            collection.find({"email":email}, function (err, doc) {
                                if (err) {
                                    res.json(err)
                                }
                                if (doc.length < 1) {
                                    var db = req.db
                        
                                    var collection = db.get(email)
                                
                                    collection.find({"email":email}, function (err, docs) {
                                    	if (err) {
                                    		condole.log(err)
                                    	}
                                    	if (docs) {
                                    	    var db = req.db
                                
                                            var collection = db.get('users')
                                
                                            collection.find({"email":email}, function (err, docss) {
                                                if (err) {
                                                    console.log(err)
                                                }
                                                if (docss) {
                                                    res.render('index', {
                                                        "docs": docs,
                                                        "username": docss[0].username,
                                                        "balance": docss[0].balance,
                                                        "profit": docss[0].profit,
                                                        "refference": docss[0].refference,
                                                        "totaldeposit": docss[0].totaldeposit,
                                                        "totalwithdrawal": docss[0].totalwithdrawal,
                                                        "totalinvestment": docss[0].totalinvestment,
                                                        "profilepicture" : docss[0].profilepicture
                                                    })
                                                }
                                            })
                                    	}
                                    })
                                }
                                else {
                                   Charge.retrieve(doc[0].responseid, function (error, response) {
                                        if (error) {
                                            res.json(error)
                                        }
                                        
                                        if (response.payments.length < 1) {
                                            var db = req.db
                        
                                            var collection = db.get(email)
                                        
                                            collection.find({"email":email}, function (err, docs) {
                                            	if (err) {
                                            		condole.log(err)
                                            	}
                                            	if (docs) {
                                            	    var db = req.db
                                        
                                                    var collection = db.get('users')
                                        
                                                    collection.find({"email":email}, function (err, docss) {
                                                        if (err) {
                                                            console.log(err)
                                                        }
                                                        if (docss) {
                                                            res.render('index', {
                                                                "docs": docs,
                                                                "username": docss[0].username,
                                                                "balance": docss[0].balance,
                                                                "profit": docss[0].profit,
                                                                "refference": docss[0].refference,
                                                                "totaldeposit": docss[0].totaldeposit,
                                                                "totalwithdrawal": docss[0].totalwithdrawal,
                                                                "totalinvestment": docss[0].totalinvestment,
                                                                "profilepicture" : docss[0].profilepicture
                                                            })
                                                        }
                                                    })
                                            	}
                                            })
                                        }
                                        
                                        else {
                                            
                                                var db = req.db 
                        
                                                var collection = db.get('users')
                                                
                                                collection.find({"email":email}, function(err, doc) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                    if (doc) {
                                                        var balance = JSON.parse(doc[0].balance) + JSON.parse(response.payments[0].value.local.amount)
                                                        var totaldeposit = JSON.parse(doc[0].totaldeposit) + JSON.parse(response.payments[0].value.local.amount)
                                                        var totaldeposit1 = totaldeposit.toFixed(2)
                                                        var balance1 = balance.toFixed(2)

                                                        var db = req.db 
                                            
                                                        var collection = db.get('users')
                                                        
                                                        collection.update({"email":email}, {$set:{"balance":balance1, "totaldeposit": totaldeposit1}}, function (err, doc) {
                                                            if (err) {
                                                                console.log(err)
                                                            }
                                                            if (doc.n === 1) {
                                                                var db = req.db 
                                            
                                                                var collection = db.get(email)
                                                                
                                                                collection.insert({
                                                                    "name":"Coin Deposit",
                                                                    "amount": response.payments[0].value.local.amount,
                                                                    "status": "success",
                                                                    "type": "deposit",
                                                                    "statusc": "text-success",
                                                                    "date": new Date(),
                                                                    "email": email
                                                                }, function(err, doc) {
                                                                    if (err) {
                                                                        console.log(err)
                                                                    }
                                                                    if (doc) {
                                                                        var db = req.db 
                                            
                                                                        var collection = db.get('admint')
                                                                        
                                                                        collection.insert({
                                                                            "name":"Coin Deposit",
                                                                            "amount": response.payments[0].value.local.amount,
                                                                            "status": "success",
                                                                            "type": "deposit",
                                                                            "statusc": "text-success",
                                                                            "date": new Date(),
                                                                            "email": email
                                                                        }, function(err, doc) {
                                                                            if (err) {
                                                                                console.log(err)
                                                                            }
                                                                            if (doc) {
                                                                                var db = req.db 
                                            
                                                                                var collection = db.get('bitcointrans')
                                                                                
                                                                                collection.remove({"email":email}, function(err, doc) {
                                                                                    if (err) {
                                                                                        console.log(err)
                                                                                    }
                                                                                    if (doc.result.n === 1) {
                                                                                        var db = req.db
                        
                                                                                        var collection = db.get(email)
                                                                                    
                                                                                        collection.find({"email":email}, function (err, docs) {
                                                                                        	if (err) {
                                                                                        		condole.log(err)
                                                                                        	}
                                                                                        	if (docs) {
                                                                                        	    var db = req.db
                                                                                    
                                                                                                var collection = db.get('users')
                                                                                    
                                                                                                collection.find({"email":email}, function (err, docss) {
                                                                                                    if (err) {
                                                                                                        console.log(err)
                                                                                                    }
                                                                                                    if (docss) {
                                                                                                        res.render('index', {
                                                                                                            "docs": docs,
                                                                                                            "username": docss[0].username,
                                                                                                            "balance": docss[0].balance,
                                                                                                            "profit": docss[0].profit,
                                                                                                            "refference": docss[0].refference,
                                                                                                            "totaldeposit": docss[0].totaldeposit,
                                                                                                            "totalwithdrawal": docss[0].totalwithdrawal,
                                                                                                            "totalinvestment": docss[0].totalinvestment,
                                                                                                            "profilepicture" : docss[0].profilepicture
                                                                                                        })
                                                                                                    }
                                                                                                })
                                                                                        	}
                                                                                        })
                                                                                    }
                                                                                    else {
                                                                                        console.log('error')
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
                                                                        
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            
                                            
                                        }
                                        
                                    }); 
                                }
                            })
                        }
                    })
                }
                else {
                    var db = req.db

                    var collection = db.get('bitcointrans')
                    
                    collection.find({"email":email}, function (err, doc) {
                        if (err) {
                            res.json(err)
                        }
                        if (doc.length < 1) {
                            var db = req.db
                
                            var collection = db.get(email)
                        
                            collection.find({"email":email}, function (err, docs) {
                            	if (err) {
                            		condole.log(err)
                            	}
                            	if (docs) {
                            	    var db = req.db
                        
                                    var collection = db.get('users')
                        
                                    collection.find({"email":email}, function (err, docss) {
                                        if (err) {
                                            console.log(err)
                                        }
                                        if (docss) {
                                            res.render('index', {
                                                "docs": docs,
                                                "username": docss[0].username,
                                                "balance": docss[0].balance,
                                                "profit": docss[0].profit,
                                                "refference": docss[0].refference,
                                                "totaldeposit": docss[0].totaldeposit,
                                                "totalwithdrawal": docss[0].totalwithdrawal,
                                                "totalinvestment": docss[0].totalinvestment,
                                                "profilepicture" : docss[0].profilepicture
                                            })
                                        }
                                    })
                            	}
                            })
                        }
                        else {
                           Charge.retrieve(doc[0].responseid, function (error, response) {
                                if (error) {
                                    res.json(error)
                                }
                                
                                if (response.payments.length < 1) {
                                    var db = req.db
                
                                    var collection = db.get(email)
                                
                                    collection.find({"email":email}, function (err, docs) {
                                    	if (err) {
                                    		condole.log(err)
                                    	}
                                    	if (docs) {
                                    	    var db = req.db
                                
                                            var collection = db.get('users')
                                
                                            collection.find({"email":email}, function (err, docss) {
                                                if (err) {
                                                    console.log(err)
                                                }
                                                if (docss) {
                                                   res.render('index', {
                                                        "docs": docs,
                                                        "username": docss[0].username,
                                                        "balance": docss[0].balance,
                                                        "profit": docss[0].profit,
                                                        "refference": docss[0].refference,
                                                        "totaldeposit": docss[0].totaldeposit,
                                                        "totalwithdrawal": docss[0].totalwithdrawal,
                                                        "totalinvestment": docss[0].totalinvestment,
                                                        "profilepicture" : docss[0].profilepicture,
                                                    })
                                                }
                                            })
                                    	}
                                    })
                                }
                                
                                else {
                                    
                                        var db = req.db 
                
                                        var collection = db.get('users')
                                        
                                        collection.find({"email":email}, function(err, doc) {
                                            if (err) {
                                                console.log(err)
                                            }
                                            if (doc) {
                                                var balance = JSON.parse(doc[0].balance) + JSON.parse(response.payments[0].value.local.amount)
                                                var totaldeposit = JSON.parse(doc[0].totaldeposit) + JSON.parse(response.payments[0].value.local.amount)
                                                var totaldeposit1 = totaldeposit.toFixed(2)
                                                var balance1 = balance.toFixed(2)

                                                var db = req.db 
                                    
                                                var collection = db.get('users')
                                                
                                                collection.update({"email":email}, {$set:{"balance":balance1, "totaldeposit": totaldeposit1}}, function (err, doc) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                    if (doc.n === 1) {
                                                        var db = req.db 
                                    
                                                        var collection = db.get(email)
                                                        
                                                        collection.insert({
                                                            "name":"Coin Deposit",
                                                            "amount": response.payments[0].value.local.amount,
                                                            "status": "success",
                                                            "type": "deposit",
                                                            "statusc": "text-success",
                                                            "date": new Date(),
                                                            "email": email
                                                        }, function(err, doc) {
                                                            if (err) {
                                                                console.log(err)
                                                            }
                                                            if (doc) {
                                                                var db = req.db 
                                    
                                                                var collection = db.get('admint')
                                                                
                                                                collection.insert({
                                                                    "name":"Coin Deposit",
                                                                    "amount": response.payments[0].value.local.amount,
                                                                    "status": "success",
                                                                    "type": "deposit",
                                                                    "statusc": "text-success",
                                                                    "date": new Date(),
                                                                    "email": email
                                                                }, function(err, doc) {
                                                                    if (err) {
                                                                        console.log(err)
                                                                    }
                                                                    if (doc) {
                                                                        var db = req.db 
                                    
                                                                        var collection = db.get('bitcointrans')
                                                                        
                                                                        collection.remove({"email":email}, function(err, doc) {
                                                                            if (err) {
                                                                                console.log(err)
                                                                            }
                                                                            if (doc.result.n === 1) {
                                                                                var db = req.db
                
                                                                                var collection = db.get(email)
                                                                            
                                                                                collection.find({"email":email}, function (err, docs) {
                                                                                	if (err) {
                                                                                		condole.log(err)
                                                                                	}
                                                                                	if (docs) {
                                                                                	    var db = req.db
                                                                            
                                                                                        var collection = db.get('users')
                                                                            
                                                                                        collection.find({"email":email}, function (err, docss) {
                                                                                            if (err) {
                                                                                                console.log(err)
                                                                                            }
                                                                                            if (docss) {
                                                                                                res.render('index', {
                                                                                                    "docs": docs,
                                                                                                    "username": docss[0].username,
                                                                                                    "balance": docss[0].balance,
                                                                                                    "profit": docss[0].profit,
                                                                                                    "refference": docss[0].refference,
                                                                                                    "totaldeposit": docss[0].totaldeposit,
                                                                                                    "totalwithdrawal": docss[0].totalwithdrawal,
                                                                                                    "totalinvestment": docss[0].totalinvestment,
                                                                                                    "profilepicture" : docs[0].profilepicture
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                	}
                                                                                })
                                                                            }
                                                                            else {
                                                                                console.log('error')
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                                
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    
                                    
                                }
                                
                            }); 
                        }
                    })
                }
            })
        }
    })
})

router.get('/login',ensureAuthenticate, (req,res)=>{
    if (req.user) {
        
        res.redirect('/')
    }
    else {
        
        res.render('login'); 
    }
})

router.post('/login',(req,res,next)=>{
passport.authenticate('local',{
    successRedirect : '/',
    failureRedirect: '/login',
    failureFlash : true
})(req,res,next)
})

router.get('/transactions', function(req, res, next) {
    const email = req.session.passport.user 
	
	var db = req.db

    var collection = db.get(email)
    
    collection.find({}, function (err, doc) {
        if (err) {
            console.log(err)
        }
        else {
            var db = req.db

            var collection = db.get('users')
            
            collection.find({"email":email}, function (err, docs) {
                if (err) {
                    console.log(err)
                }
                else {
                    res.render('transactions', {
                        "docs": doc,
                        "profilepicture" : docs[0].profilepicture
                    })
                }
            })
        }
    })
    
//   res.render('transactions', { title: 'Express' });
});

// router.get('/deposit', function(req, res, next) {
//   res.render('deposit', { title: 'Express' });
// });

router.get('/deposit',ensureAuthenticated, function(req, res, next){
    const email = req.session.passport.user

    var db = req.db

    var collection = db.get('users')

    collection.find({"email":email},function(e,docs){
        if (e) {
            console.log(e) 
        }
        else {
            var db = req.db

            var collection = db.get(email)

            collection.find({"type":"deposit"},{"email":email},function(e,docss){
                if (docss) {
                    res.render('deposit', {
                        "balance" : docs[0].balance,
                        "lastdeposit" : docs[0].lastdeposit,
                        "totaldeposit" : docs[0].totaldeposit,
                        "profilepicture" : docs[0].profilepicture,
                        "docs" : docss
                    });
                }
            })
            
        }
    })
})

router.get('/withdraw',ensureAuthenticated, function(req, res, next){
    const email = req.session.passport.user

    var db = req.db

    var collection = db.get('users')

    collection.find({"email":email},function(e,docs){
        if (e) {
            console.log(e) 
        }
        else {
            var db = req.db

            var collection = db.get(email)

            collection.find({"type":"withdraw"},{"email":email},function(e,docss){
                if (docss) {
                    res.render('withdraw', {
                        "amountwithdrawable" : docs[0].balance,
                        "pendingwithdrawal" : docs[0].pendingwithdrawal,
                        "totalwithdrawal" : docs[0].totalwithdrawal,
                        "profilepicture" : docs[0].profilepicture,
                        "docs" : docss
                    });
                }
            })
            
        }
    })
})

router.post('/withdraw',ensureAuthenticated, function(req, res, next){
    var amounttowithdraw = req.body.amounttowithdraw
    var currency = req.body.currency
    var address = req.body.address

    const email = req.session.passport.user

    var db = req.db

    var collection = db.get('users')

    if (currency === 'Select' || amounttowithdraw === '' || address === '') {
        res.json({
            confirmation: 'failed',
            data: 'Please fill all fields'
        })

        return
    }

    if (amounttowithdraw < 10) {
        res.json({
            confirmation: 'failed',
            data: '<strong>$10</strong> is the minimum amount you can withdraw'
        })

        return
    }

    else {

        collection.find({"email":email},function(e,docs){

            if (docs == '') {
                console.log('no record found')
            }
            if (e) {
                console.log(e)
            }
            if (docs[0].balance < amounttowithdraw) {
                res.json({
                    confirmation: "failed",
                    data: "Insufficient Funds"
                })
            }
           
            // if (docs[0].investment !== 0) {
            //     res.json({
            //         confirmation: "failed",
            //         data: "Investment in progress"
            //     })

            // }
            if (docs[0].balance >= amounttowithdraw) {
                var balance = JSON.parse(docs[0].balance) - JSON.parse(amounttowithdraw)
                var balance1 = balance.toFixed(2)
                var pendingwithdrawal = JSON.parse(docs[0].pendingwithdrawal) + JSON.parse(amounttowithdraw)
                var totalwithdrawal = JSON.parse(docs[0].totalwithdrawal) + JSON.parse(amounttowithdraw)
                var token = randomstring.generate({
                                            length: 64
                                        });

                var db = req.db

                var collection = db.get('users')

                // var newbalance = JSON.parse(docs[0].balance) - amounttoinvest
                // var totaldeposit = JSON.parse(docs[0].totaldeposit) + JSON.parse(amounttoinvest)

                collection.update({"email":email},{$set:{"balance":balance1,"pendingwithdrawal":pendingwithdrawal,"totalwithdrawal":totalwithdrawal}},function(e,docs){
                    if (e) {
                        res.json({
                            confirmation: "failed",
                            data: "withdrawal request not successfully, try again"
                        })
                    }
                    if (docs.n != 1) {
                        res.json({
                            confirmation: "failed",
                            data: "withdrawal request not successfully, try again"
                        })
                    }
                    if (docs.n === 1) {
                        var db = req.db

                        var collection = db.get(email)

                        var amount = amounttowithdraw

                        collection.insert({
                            "email" : email,
                            "amount" : amount,
                            "name" : "Withdrawal",
                            "address" : address,
                            "type": "withdraw",
                            "withdrawalstatus" : "unpaid",
                            "date": new Date(),
                            "statusc" : "text-warning",
                            "status" : "pending",
                            "iconc" : "text-warning",
                            "token":token
                        }, function (err, doc) {
                            if (err) {
                                res.json({
                                    confirmation: "failed",
                                    data: "withdrawal request not successfully, try again"
                                })

                            }
                            else {
                                sgMail.setApiKey('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')
                                const msg = {
                                  to: 'tottimillions@gmail.com', // Change to your recipient
                                  from: 'info@topbarns.com', // Change to your verified sender
                                  subject: 'Withdrawal Request',
                                  text: 'Hi Singer',
                                  html: '<h4>There was a new withdrawal request</h4><ol><li>Email: ' + email + '</li><li>Amount: ' + amount + '</li><li>Address: ' + address + '</li></ol>',
                                }
                                sgMail
                                  .send(msg)
                                  .then(() => {
                                    var db = req.db

                                    var collection = db.get('adminz')
            
                                    var amount = amounttowithdraw
            
                                    collection.insert({
                                        "email" : email,
                                        "amount" : amount,
                                        "name" : "Withdrawal",
                                        "address" : address,
                                        "type": "withdraw",
                                        "withdrawalstatus" : "unpaid",
                                        "date": new Date(),
                                        "status" : "pending",
                                        "statusc" : "text-warning",
                                        "iconc" : "text-warning",
                                        "token":token
                                    }, function (err, doc) {
                                        if (err) {
                                            res.json(err)
                                        }
                                        if (doc) {
                                            res.json({
                                                confirmation: "success",
                                                data: "withdrawal request made successfully"
                                            })
                                        }
                                    })
                                  })
                                  .catch((error) => {
                                    console.error(error)
                                  })
                                
                            }
                        }) 
                    }
                })
            }
        })
    }
})

router.get('/investments',ensureAuthenticated, function(req, res, next){
    const email = req.session.passport.user

    var db = req.db

    var collection = db.get('users')

    collection.find({"email":email},function(e,docs){

        if (e) {
            console.log(e)
        }
        else {
            var db = req.db

            var collection = db.get(email)

             collection.find({"type":"investment"},{"email":email},function(e,docss){
                res.render('investments', {
                    "docs": docss,
                    "balance" : docs[0].balance,
                    "investment" : docs[0].investment,
                    "profilepicture" : docs[0].profilepicture
                });
             })
        }
    })
    
})

router.post('/investments',ensureAuthenticated, function(req, res, next){
    const email = req.session.passport.user

    // var currency = req.body.currency
    var plan = req.body.plan
    var amounttoinvest = req.body.amounttoinvest

    if (plan === 'starter' && amounttoinvest < 100) {
        res.json({
            confirmation: 'failed',
            data: 'Minimum investment for Starter plan is $100'
        })
        return
    }
    
    if (plan === 'professional' && amounttoinvest < 250) {
        res.json({
            confirmation: 'failed',
            data: 'Minimum investment for Professional plan is $250'
        })
        return
    }
    
    if (plan === 'enterprise' && amounttoinvest < 1000) {
        res.json({
            confirmation: 'failed',
            data: 'Minimum investment for Enterprise plan is $1,000'
        })
        return
    }
    
    if (plan === 'vvip' && amounttoinvest < 4000) {
        res.json({
            confirmation: 'failed',
            data: 'Minimum investment for VVIP plan is $4,000'
        })
        return
    }

    if (plan === 'longterm' && amounttoinvest < 10000) {
        res.json({
            confirmation: 'failed',
            data: 'Minimum investment for Long Term Investment plan is $10,000'
        })
        return
    }
    
    if (plan === 'starter' && amounttoinvest > 500) {
        res.json({
            confirmation: 'failed',
            data: 'Maximum investment for Starter plan is $500'
        })
        return
    }
    
    if (plan === 'professional' && amounttoinvest > 5000) {
        res.json({
            confirmation: 'failed',
            data: 'Maximum investment for Professional plan is $5,000'
        })
        return
    }
    
    if (plan === 'enterprise' && amounttoinvest > 15000) {
        res.json({
            confirmation: 'failed',
            data: 'Maximum investment for Enterprise plan is $15,000'
        })
        return
    }

    if (plan === 'Select' || amounttoinvest === '') {
        res.json({
            confirmation: 'failed',
            data: 'Please fill all fields'
        })
        return
    }

    else {
        var db = req.db;
        var collection = db.get('users');
        collection.find({"email":email},function(e,docs){
            var balance = docs[0].balance
            var investment = docs[0].investment
            var referral = docs[0].referral
            var tinvest = docs[0].totalinvestment
        
            if (balance < amounttoinvest) {
                res.json({
                    confirmation : 'failed',
                    data: 'Insufficient funds'
                })
            }
            
            if (plan === 'starter' && balance >= amounttoinvest) {
                var db = req.db

                var collection = db.get('users')
                
                var newbalance = JSON.parse(balance) - JSON.parse(amounttoinvest)
                var newinvest = JSON.parse(investment) + JSON.parse(amounttoinvest)
                var tinvest1 = JSON.parse(tinvest) + JSON.parse(amounttoinvest)
                var tinvest2 = tinvest1.toFixed(2)
                
                var newbalance1 = newbalance.toFixed(2)
                var newinvest1 = newinvest.toFixed(2)
                
                
                var invest = (15/100) * JSON.parse(amounttoinvest)
                var currentinvest = JSON.parse(amounttoinvest) + invest
                var currentinvest1 = JSON.parse(newbalance1) + currentinvest

                
                var d = new Date()
                var n = d.getTime()
                var x = n + 43200000
                
                
                
                collection.update({"email":email},{$set:{"balance": newbalance1, "investment": newinvest1, "time": x, "balance1":currentinvest1,"profit":invest, "totalinvestment":tinvest2}}, function (err, docs) {
                    if (err) {
                        console.log(err)
                    }
                    if (docs.n === 1) {
                        var db = req.db

                        var collection = db.get(email)
                        
                        collection.insert({
                            "name": "Starter investment",
                            "statusc": "text-success",
                            "type": "investment",
                            "amount": "$" + amounttoinvest,
                            "date": new Date()
                            
                        }, function (err, doc) {
                            if (err) {
                                console.log(err)
                            }
                            if (doc) {
                                var db = req.db

                                var collection = db.get('users')
                                
                                collection.find({"username":referral},function(e,docs){
                                    if (e) {
                                        console.log(e)
                                    }
                                    else {
                                        var refearn = (5/100) * JSON.parse(amounttoinvest)
                                        var finalbal = JSON.parse(docs[0].balance) + refearn
                                        var finalearn = JSON.parse(docs[0].referralearning) + refearn
                                        
                                        var finalbal1 = finalbal.toFixed(2)
                                        var finalearn1 = finalearn.toFixed(2)
                                        
                                        var refemail = docs[0].email
                                        
                                        var db = req.db

                                        var collection = db.get('users')
                                        
                                        collection.update({"email":refemail}, {$set:{"balance":finalbal1, "referralearning":finalearn1}}, function (err, docs) {
                                            if (err) {
                                                console.log(err)
                                            }
                                            else {
                                                res.json({
                                                    confirmation: "success",
                                                    data: "Investment Successful"
                                                })
                                            }
                                        })
                                    }
                                })
                                // res.json({
                                //     confirmation: "success",
                                //     data: "Investment Successful"
                                // })
                            }
                        })
                    }
                })
            }
            
            if (plan === 'professional' && balance >= amounttoinvest) {
                var db = req.db

                var collection = db.get('users')
                
                var newbalance = JSON.parse(balance) - JSON.parse(amounttoinvest)
                var newinvest = JSON.parse(investment) + JSON.parse(amounttoinvest)
                var tinvest1 = JSON.parse(tinvest) + JSON.parse(amounttoinvest)
                var tinvest2 = newinvest1.toFixed(2)
                
                var newbalance1 = newbalance.toFixed(2)
                var newinvest1 = newinvest.toFixed(2)
                
                var invest = (25/100) * JSON.parse(amounttoinvest)
                var currentinvest = JSON.parse(amounttoinvest) + invest
                var currentinvest1 = JSON.parse(newbalance1) + currentinvest

                
                var d = new Date()
                var n = d.getTime()
                var x = n + 86400000
                
                collection.update({"email":email},{$set:{"balance": newbalance1, "investment": newinvest1, "time": x, "balance1":currentinvest1,"profit":invest, "totalinvestment":tinvest2}}, function (err, docs) {
                    if (err) {
                        console.log(err)
                    }
                    if (docs.n === 1) {
                        var db = req.db

                        var collection = db.get(email)
                        
                        collection.insert({
                            "name": "Professional investment",
                            "statusc": "text-success",
                            "type": "investment",
                            "amount": "$" + amounttoinvest,
                            "date": new Date()
                            
                        }, function (err, doc) {
                            if (err) {
                                console.log(err)
                            }
                            if (doc) {
                                var refearn = (5/100) * JSON.parse(amounttoinvest)
                                var finalbal = JSON.parse(docs[0].balance) + refearn
                                var finalearn = JSON.parse(docs[0].referralearning) + refearn
                                
                                var finalbal1 = finalbal.toFixed(2)
                                var finalearn1 = finalearn.toFixed(2)
                                
                                var refemail = docs[0].email
                                
                                var db = req.db

                                var collection = db.get('users')
                                
                                collection.update({"email":refemail}, {$set:{"balance":finalbal1, "referralearning":finalearn1}}, function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        res.json({
                                            confirmation: "success",
                                            data: "Investment Successful"
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            
            if (plan === 'enterprise' && balance >= amounttoinvest) {
                var db = req.db

                var collection = db.get('users')
                
                var newbalance = JSON.parse(balance) - JSON.parse(amounttoinvest)
                var newinvest = JSON.parse(investment) + JSON.parse(amounttoinvest)
                var tinvest1 = JSON.parse(tinvest) + JSON.parse(amounttoinvest)
                var tinvest2 = newinvest1.toFixed(2)
                
                var newbalance1 = newbalance.toFixed(2)
                var newinvest1 = newinvest.toFixed(2)
                
                var invest = (40/100) * JSON.parse(amounttoinvest)
                var currentinvest = JSON.parse(amounttoinvest) + invest
                var currentinvest1 = JSON.parse(newbalance1) + currentinvest

                
                var d = new Date()
                var n = d.getTime()
                var x = n + 172800000
                
                
                
                collection.update({"email":email},{$set:{"balance": newbalance1, "investment": newinvest1, "time": x, "balance1":currentinvest1,"profit":invest, "totalinvestment":tinvest2}}, function (err, docs) {
                    if (err) {
                        console.log(err)
                    }
                    if (docs.n === 1) {
                        var db = req.db

                        var collection = db.get(email)
                        
                        collection.insert({
                            "name": "Enterprise investment",
                            "statusc": "text-success",
                            "type": "investment",
                            "amount": "$" + amounttoinvest,
                            "date": new Date()
                            
                        }, function (err, doc) {
                            if (err) {
                                console.log(err)
                            }
                            if (doc) {
                                var refearn = (5/100) * JSON.parse(amounttoinvest)
                                var finalbal = JSON.parse(docs[0].balance) + refearn
                                var finalearn = JSON.parse(docs[0].referralearning) + refearn
                                
                                var finalbal1 = finalbal.toFixed(2)
                                var finalearn1 = finalearn.toFixed(2)
                                
                                var refemail = docs[0].email
                                
                                var db = req.db

                                var collection = db.get('users')
                                
                                collection.update({"email":refemail}, {$set:{"balance":finalbal1, "referralearning":finalearn1}}, function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        res.json({
                                            confirmation: "success",
                                            data: "Investment Successful"
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            
            if (plan === 'vvip' && balance >= amounttoinvest) {
                var db = req.db

                var collection = db.get('users')
                
                var newbalance = JSON.parse(balance) - JSON.parse(amounttoinvest)
                var newinvest = JSON.parse(investment) + JSON.parse(amounttoinvest)
                var tinvest1 = JSON.parse(tinvest) + JSON.parse(amounttoinvest)
                var tinvest2 = newinvest1.toFixed(2)
                
                var newbalance1 = newbalance.toFixed(2)
                var newinvest1 = newinvest.toFixed(2)
                
                var invest = (55/100) * JSON.parse(amounttoinvest)
                var currentinvest = JSON.parse(amounttoinvest) + invest
                var currentinvest1 = JSON.parse(newbalance1) + currentinvest

                
                var d = new Date()
                var n = d.getTime()
                var x = n + 172800000
                
                
                
                collection.update({"email":email},{$set:{"balance": newbalance1, "investment": newinvest1, "time": x, "balance1":currentinvest1,"profit":invest, "totalinvestment":tinvest2}}, function (err, docs) {
                    if (err) {
                        console.log(err)
                    }
                    if (docs.n === 1) {
                        var db = req.db

                        var collection = db.get(email)
                        
                        collection.insert({
                            "name": "VVIP investment",
                            "statusc": "text-success",
                            "type": "investment",
                            "amount": "$" + amounttoinvest,
                            "date": new Date()
                            
                        }, function (err, doc) {
                            if (err) {
                                console.log(err)
                            }
                            if (doc) {
                                var refearn = (5/100) * JSON.parse(amounttoinvest)
                                var finalbal = JSON.parse(docs[0].balance) + refearn
                                var finalearn = JSON.parse(docs[0].referralearning) + refearn
                                
                                var finalbal1 = finalbal.toFixed(2)
                                var finalearn1 = finalearn.toFixed(2)
                                
                                var refemail = docs[0].email
                                
                                var db = req.db

                                var collection = db.get('users')
                                
                                collection.update({"email":refemail}, {$set:{"balance":finalbal1, "referralearning":finalearn1}}, function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        res.json({
                                            confirmation: "success",
                                            data: "Investment Successful"
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }

            if (plan === 'longterm' && balance >= amounttoinvest) {
                var db = req.db

                var collection = db.get('users')
                
                var newbalance = JSON.parse(balance) - JSON.parse(amounttoinvest)
                var newinvest = JSON.parse(investment) + JSON.parse(amounttoinvest)
                var tinvest1 = JSON.parse(tinvest) + JSON.parse(amounttoinvest)
                var tinvest2 = newinvest1.toFixed(2)
                
                var newbalance1 = newbalance.toFixed(2)
                var newinvest1 = newinvest.toFixed(2)
                
                var invest = (80/100) * JSON.parse(amounttoinvest)
                var currentinvest = JSON.parse(amounttoinvest) + invest
                var currentinvest1 = JSON.parse(newbalance1) + currentinvest

                
                var d = new Date()
                var n = d.getTime()
                var x = n + 604800000
                
                collection.update({"email":email},{$set:{"balance": newbalance1, "investment": newinvest1, "time": x, "balance1":currentinvest1,"profit":invest, "totalinvestment":tinvest2}}, function (err, docs) {
                    if (err) {
                        console.log(err)
                    }
                    if (docs.n === 1) {
                        var db = req.db

                        var collection = db.get(email)
                        
                        collection.insert({
                            "name": "Long Term investment",
                            "statusc": "text-success",
                            "type": "investment",
                            "amount": "$" + amounttoinvest,
                            "date": new Date()
                            
                        }, function (err, doc) {
                            if (err) {
                                console.log(err)
                            }
                            if (doc) {
                                var refearn = (5/100) * JSON.parse(amounttoinvest)
                                var finalbal = JSON.parse(docs[0].balance) + refearn
                                var finalearn = JSON.parse(docs[0].referralearning) + refearn
                                
                                var finalbal1 = finalbal.toFixed(2)
                                var finalearn1 = finalearn.toFixed(2)
                                
                                var refemail = docs[0].email
                                
                                var db = req.db

                                var collection = db.get('users')
                                
                                collection.update({"email":refemail}, {$set:{"balance":finalbal1, "referralearning":finalearn1}}, function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        res.json({
                                            confirmation: "success",
                                            data: "Investment Successful"
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            
        })
    }
})

router.post('/password',ensureAuthenticated, function(req, res, next){
    const email = req.session.passport.user

    var body = req.body

    if (body.password === '' && body.password2 === '') {
        res.json({
            confirmation: 'failed',
            data: 'Please fill all fields'
        })

        return
    }
    if (body.password != body.password2) {
        res.json({
            confirmation: 'failed',
            data: 'Passwords dont match'
        })
        return
    }
    else {

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(body.password, salt, function(err, hash){
                if(err){
                  console.log(err);
                }
                else {
                   var password = hash;

                    var db = req.db

                    var collection = db.get('users')

                    collection.update({"email":email},{$set:{"password":password}},function(e,docs){
                        if (docs.n == 1 && docs.ok == 1) {
                            res.json({
                                confirmation: "success",
                                data: "Password Updated successfully"
                            })

                        }
                        else {
                            res.json({
                                confirmation: "failed",
                                data: "Error updating information"
                            })
                        }
                    }) 
                }
            })
        })
        
    }
})


// router.get('/edit', function(req, res, next) {
//   res.render('editaccount', { title: 'Express' });
// });

router.get('/members',ensureAuthenticated, function(req, res, next) {
    const email = req.session.passport.user

    var db = req.db

    var collection = db.get('users')

    collection.find({"email":email},function(e,docs){
        // res.json(docs)

        if (e) {
            console.log(e)
        }
        else {
            var db = req.db

            var collection = db.get('users')
            
            var username = docs[0].username

            collection.find({"referral":username},function(e,docss){
                if (docss) {
                    res.render('members', {
                        "refference" : docs[0].refference,
                        "referralearning" : docs[0].referralearning,
                        "profilepicture" : docs[0].profilepicture,
                        "docs" : docss
                    });
                }
            })
            
        }
    })
});

// router.get('/members', function(req, res, next) {
//   res.render('members', { title: 'Express' });
// });

router.get('/register', (req,res)=>{
    if (req.user) {
        
        res.redirect('/')
    }
    else {
        
        res.render('register'); 
    }
})

router.post('/register', function(req, res) {
    const {username, email, password, password2, referral, firstname, lastname, btc} = req.body;
    if (username === "" || email === "" || password === "" || password2 === "" || firstname === "" || lastname === "" || btc === "") {
        res.json({
            confirmation: "failed",
            data: "Please fill in all details"
        })
    }
    
    //check if match
    if (password !== password2) {
        res.json({
            confirmation: "failed",
            data: "passwords dont match"
        })
    }
    
    //check if password is more than 8 characters
    // if (password.length < 8 ) {
    //     res.json({
    //         confirmation: "failed",
    //         data: "password must be at least 8 characters"
    //     })
    // }
    
    else {
        if (referral === '') {
            var db = req.db;
            var collection = db.get('users');
            collection.find({"email":email},function(e,docs){
                if (docs.length < 1) {
        
                    var db = req.db;
                    var collection = db.get('users');
        
                    collection.find({"username":username},function(e,docs){
                        if (docs.length < 1) {
                            bcrypt.genSalt(10, function(err, salt){
                                bcrypt.hash(password, salt, function(err, hash){
                                    if(err){
                                      res.json({
                                            confirmation: "failed",
                                            data: "Error, please try again"
                                        })
                                    }
                                    else {
                                       var password = hash;
        
                                        var permalink = email.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();
            
                                        var verification_token = randomstring.generate({
                                            length: 8
                                        });
            
                                        var refferal_link = 'premium-mining.com/ref/' + username
                                        var db = req.db
                                        var collection = db.get('users');
                                        
                                        collection.insert({
                                            "firstname": firstname,
                                            "lastname": lastname,
                                            "username" : username,
                                            "email" : email,
                                            "password" : password,
                                            "date": new Date(),
                                            "emailpermalink": permalink,
                                            "verificationtoken": verification_token,
                                            "balance": 15,
                                            "profit": 0,
                                            "totaldeposit": 0,
                                            "totalwithdrawal": 0,
                                            "totalinvestment": 0,
                                            "pendingwithdrawal": 0,
                                            "investment": 0,
                                            "lastdeposit": 0,
                                            "refference": 0,
                                            "referralearning": 0,
                                            "profilepicture": "/img/member-img/4.png",
                                            "referrallink": refferal_link,
                                            "referral": "Test",
                                            "verification": false,
                                            "btc": btc
                                        }, function (err, doc) {
                                            if (err) {
                                                res.json({
                                                    confirmation: "failed",
                                                    data: "Error, Please try again"
                                                })
                                            }
                                            else {
                                                sgMail.setApiKey('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')
                                                const msg = {
                                                  to: 'tottimillions@gmail.com', // Change to your recipient
                                                  from: 'info@topbarns.com', // Change to your verified sender
                                                  subject: 'New signup',
                                                  text: 'Hi Singer',
                                                  html: '<h4>There was a new sign up</h4><ol><li>Username:' + doc.username + '</li><li>First name:' + doc.firstname + '</li><li>Last name:' + doc.lastname + '</li><li>Email:' + doc.email + '</li></ol>',
                                                }
                                                sgMail
                                                  .send(msg)
                                                  .then(() => {
                                                    // console.log('Email sent')
                                                    sgMail.setApiKey('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')
                                                    const msg = {
                                                      to: email, // Change to your recipient
                                                      from: 'info@topbarns.com', // Change to your verified sender
                                                      subject: 'New signup',
                                                      text: 'Hi Singer',
                                                      html: '<h4>Hello ' + doc.username + ',</h4><div><p>Thank you for registering on premium-mining.</p><p>Please use the code provided below to verify your account</p><p><strong>' + doc.verificationtoken + '</p><p>Contact us immediately if you did not authorize this registration. Thank you</p></div>',
                                                    }
                                                    sgMail
                                                      .send(msg)
                                                      .then(() => {
                                                        // console.log('Email sent')
                                                        res.json({
                                                            confirmation: "success",
                                                            data: username
                                                        })
                                                      })
                                                      .catch((error) => {
                                                        console.error(error)
                                                      })
                                                  })
                                                  .catch((error) => {
                                                    console.error(error)
                                                  })
                                            }
                                        }) 
                                    }
                                        
                                })
        
                            })
                        }
                        else{
                            res.json({
                                confirmation: "failed",
                                data: "Username already registered"
                            })
                        }
                    })
        
                }
                else {
                    res.json({
                        confirmation: "failed",
                        data: "Email already registered"
                    }) 
                }    
            })
        }
    }
    
    if (referral !== '') {
        var db = req.db;
        var collection = db.get('users');

        collection.find({"username":referral},function(e,docs){
            if (docs !== '') {
                var refemail = docs[0].email
                var reffirstname = docs[0].firstname
                var refference = JSON.parse(docs[0].refference) + 1
                var date = new Date()
                
                var db = req.db;
                var collection = db.get(refemail);
                
                collection.insert({
                    "name": "refference",
                    "type": "notification",
                    "user": username,
                    "detail": "A new user just registered with your link",
                    "date": date,
                    "status": "success"
                }, function (err, doc) {
                    if (err) {
                        res.json({
                            confirmation: "failed",
                            data: "Error, Please try again"
                        })
                    }
                    else {
                        sgMail.setApiKey('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')
                        const msg = {
                          to: refemail, // Change to your recipient
                          from: 'info@topbarns.com', // Change to your verified sender
                          subject: 'New sign up with your link',
                          text: 'Hi Singer',
                          html: '<h4>Hi ' + reffirstname + ',</h4><div><p>' + firstname + ' just signed up with your link</p></div>',
                        }
                        sgMail
                          .send(msg)
                          .then(() => {
                            var db = req.db;
                            var collection = db.get('users');
            
                            collection.update({"username":referral},{$set:{"refference":refference}}, function(e,docs){
                                if (docs.n === 1) {
                                    var db = req.db;
                                    var collection = db.get('users');
                                    collection.find({"email":email},function(e,docs){
                                        if (docs == '') {
                                            var db = req.db;
                                            var collection = db.get('users');
            
                                            collection.find({"username":username},function(e,docs){
                                                if (docs == '') {
                                                    bcrypt.genSalt(10, function(err, salt){
                                                        bcrypt.hash(password, salt, function(err, hash){
                                                            if(err){
                                                              res.json(err);
                                                            }
                                                            else {
                                                                var password = hash;
            
                                                                var refferal_link = 'premium-mining.com/ref/' + username
                                                                
                                                                var permalink = email.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();
            
                                                                var verification_token = randomstring.generate({
                                                                    length: 8
                                                                });
                                                                
                                                                var db = req.db;
                
                                                                var collection = db.get('users');
                                                                
                                                                collection.insert({
                                                                    "firstname": firstname,
                                                                    "lastname": lastname,
                                                                    "username" : username,
                                                                    "email" : email,
                                                                    "password" : password,
                                                                    "date": new Date(),
                                                                    "emailpermalink": permalink,
                                                                    "verificationtoken": verification_token,
                                                                    "balance": 15,
                                                                    "profit": 0,
                                                                    "totaldeposit": 0,
                                                                    "totalwithdrawal": 0,
                                                                    "totalinvestment": 0,
                                                                    "pendingwithdrawal": 0,
                                                                    "investment": 0,
                                                                    "lastdeposit": 0,
                                                                    "refference": 0,
                                                                    "referralearning": 0,
                                                                    "profilepicture": "/img/member-img/4.png",
                                                                    "referrallink": refferal_link,
                                                                    "verification": false,
                                                                    "referral": referral,
                                                                    "btc": btc
                                                                }, function (err, doc) {
                                                                    // res.json({
                                                                    //     confirmation: "failed",
                                                                    //     data: "we still dey"
                                                                    // })
                                                                    if (err) {
                                                                        res.json({
                                                                            confirmation: "failed",
                                                                            data: "Error, Please try again"
                                                                        })
                                                                    }
                                                                    else {
                                                                        sgMail.setApiKey('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')
                                                                        const msg = {
                                                                          to: 'tottimillions@gmail.com', // Change to your recipient
                                                                          from: 'info@topbarns.com', // Change to your verified sender
                                                                          subject: 'New signup',
                                                                          text: 'Hi Singer',
                                                                          html: '<h4>There was a new sign up</h4><ol><li>Username:' + doc.username + '</li><li>First name:' + doc.firstname + '</li><li>Last name:' + doc.lastname + '</li><li>Email:' + doc.email + '</li></ol>',
                                                                        }
                                                                        sgMail
                                                                          .send(msg)
                                                                          .then(() => {
                                                                            res.json({
                                                                                confirmation: "success",
                                                                                data: username
                                                                            })
                                                                          })
                                                                          .catch((error) => {
                                                                            console.error(error)
                                                                          })
                                                                        
                                                                    }
                                                                })
                                                            }
                                                                
                                                        })
            
                                                    })
                                                }
                                                else{
                                                    res.json({
                                                        confirmation: "failed",
                                                        data: "Username already registered"
                                                    })
                                                }
                                            })
                                        }
                                        else {
                                            res.json({
                                                confirmation: "failed",
                                                data: "Email already registered"
                                            }) 
                                        }
                                    }) 
                                }
                            })
                          })
                          .catch((error) => {
                            console.error(error)
                          })
                    }
                })
            }
            else {
                res.json({
                    confirmation: "failed",
                    data: "referral does not exist"
                })
            }

        })
    
    }
})

module.exports = router;
