var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var exec = require('child_process').exec;
var cors = require('cors')
var shelljs = require('shelljs')
var jsSHA = require('jsSHA');
app.use(express.static('public'));
app.use(bodyParser.json());
var request = require('request');
var jwt = require('jsonwebtoken');
var appToken = "";
// app.use(bodyParser.json());
var sha512 = require('js-sha512')
var crypto = require('crypto');
var jwtPrivatekey1 = "guyyuguygiuhgytdykg";

var loginDetails = require('./users.json');

var mainreleaseNotes = require('./tasks/main-release-notes');
var dummyReleaseNotes = require('./tasks/dummy-release-notes');

var mainDocs = require('./tasks/main-docs');
var dummyDocs = require('./tasks/dummy-docs');

var mainApi = require('./tasks/main-api');
var dummyApi = require('./tasks/dummy-api');

var esBuild = require('./tasks/es-build');

var buildInfo = require('./tasks/buildinfor');


var dummyPatchRealease = require('./tasks/dummy-patch-release');
var mainPatchRealease = require('./tasks/main-patch-release');

var dummyVolRelease = require('./tasks/dummy-vol-release');
var mainVolRelease = require('./tasks/main-vol-release');

var mail = require('./tasks/mail');

const authorization = (req, res, next) => {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  if (req.body.token === "" || req.body.token === undefined) {
    res.status('401');
    return res.send('Token gone');
  }

  var tempToken = jwt.verify(req.body.token, jwtPrivatekey1);
  var tempVariable = false;
  for (var i = 0; i < loginDetails.users.length; i++) {
    if (loginDetails.users[i].username === tempToken.username) {
      if (loginDetails.users[i].password === tempToken.password) {
        return next();
      } else {
        tempVariable = true;
      }
    } else {
      tempVariable = true;
    }
  }
  if (tempVariable) {
    res.status('401');
    return res.send('access denied');
  }
};
app.use(cors());

function checker(str) {
  return crypto.createHash('sha512').update(str).digest('hex');
}

// module.exports = {
//   "server": {
//     "baseDir": "src",
//     "routes": {
//       "/node_modules": "node_modules"
//     },
//     middleware: {
//       1: app,
//   },
// },
// port:3001,
// };

app.post("/api/check2", function (req, res) {
  console.log("Received");
  res.send({
      data: 'worked' 
    });
});

app.post("/api/checkss", function (req, res) {
  var verified = "No";
  var txnid = req.body.txnid;
  var amount = req.body.amount;
  var productinfo = req.body.productinfo;
  var firstname = req.body.firstname;
  var email = req.body.email;
  var udf5 = req.body.udf5;
  var mihpayid = req.body.mihpayid;
  var status = req.body.status;
  var resphash = req.body.hash;
  var additionalcharges = "";
  //Calculate response hash to verify

  var keyString =
    '7rnFly' +
    "|" +
    '3456' +
    "|" +
    '350' +
    "|" +
    productinfo +
    "|" +
    firstname +
    "|" +
    email +
    "|||||" +
    udf5 +
    "|||||";
  var keyArray = keyString.split("|");
  var reverseKeyArray = keyArray.reverse();
  var reverseKeyString = 'pjVQAWpA' + "|" + status + "|" + reverseKeyArray.join("|");
  //check for presence of additionalcharges parameter in response.
  if (typeof req.body.additionalCharges !== "undefined") {
    additionalcharges = req.body.additionalCharges;
    //hash with additionalcharges
    reverseKeyString = additionalcharges + "|" + reverseKeyString;
  }
  //Generate Hash
  var cryp = crypto.createHash("sha512");
  cryp.update(reverseKeyString);
  var calchash = cryp.digest("hex");

  var msg =
    "Payment failed for Hash not verified...<br />Check Console Log for full response...";
  //Comapre status and hash. Hash verification is mandatory.
  if (calchash == resphash)
    msg =
      "Transaction Successful and Hash Verified...<br />Check Console Log for full response...";

  console.log(req.body);

  //Verify Payment routine to double check payment
  var command = "verify_payment";

  var hash_str = '7rnFly' + "|" + command + "|" + txnid + "|" + 'pjVQAWpA';
  var vcryp = crypto.createHash("sha512");
  vcryp.update(hash_str);
  var vhash = vcryp.digest("hex");

  var vdata = "";
  var details = "";

  var options = {
    method: "POST",
    uri: "https://test.payu.in/merchant/postservice.php?form=2",
    form: {
      key: '7rnFly',
      hash: vhash,
      var1: txnid,
      command: command,
    },
    headers: {
      //  /'content-type': 'application/x-www-form-urlencoded' /
      // Is set automatically
    },
  };
  // res.send({
  //   data: options 
  // });
  request.post(options)
    .on("response", function (resp) {
      console.log("STATUS:" + resp.statusCode);
      resp.setEncoding("utf8");
      resp.on("data", function (chunk) {
        vdata = JSON.parse(chunk);
        if (vdata.status == "1") {
          details = vdata.transaction_details[txnid];
          console.log(details["status"] + "   " + details["mihpayid"]);
          if (details["status"] == "success" && details["mihpayid"] == mihpayid)
            verified = "Yes";
          else verified = "No";
          res.render(__dirname + "/response.html", {
            txnid: txnid,
            amount: amount,
            productinfo: productinfo,
            additionalcharges: additionalcharges,
            firstname: firstname,
            email: email,
            mihpayid: mihpayid,
            status: status,
            resphash: resphash,
            msg: msg,
            verified: verified,
          });
        }
      });
    })
    .on("error", function (err) {
      console.log(err);
    });
});

app.post('/api/login', (req, res) => {
  debugger
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  jwt.sign({
    username: req.body.username,
    password: req.body.password
  }, jwtPrivatekey1, {
      algorithm: 'HS256'
    }, function (err, token) {

      // var tempCheck= jwt.verify(token, jwtPrivatekey1)
      for (var i = 0; i < loginDetails.users.length; i++) {
        if (loginDetails.users[i].username === req.body.username) {
          if (loginDetails.users[i].password === req.body.password) {
            appToken = jwt.sign({
              username: loginDetails.users[i].username,
              password: loginDetails.users[i].password
            }, jwtPrivatekey1, {
                algorithm: 'HS256'
              });
          }
        }
      }
      if (appToken === "") {
        res.send('Login credentials mismatched');
      } else {
        res.send({
          token: appToken
        });
      }
    });
})


app.post('/api/send', function (req, res) {

  var cusName = req.body.values;
  var cusMobileNo = reqdata && reqdata.repo;
  var cusMail = '';
  var regarding = '';
  var content = '';
  debugger
  mail('repo', 'reqdata.branchDoc', 'reqdata.version', function (error, info) {
    res.send({
      status: 'build started',
      jobName: data.jobName
    });
  }, 'reqdata.release_Type', 'reqdata.selectPlatform');


});

app.listen(3007, function () {
  console.log('Example app listening on port 3000!');
});