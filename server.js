var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors')

app.use(express.static('public'));
app.use(bodyParser.json());

var mail = require('./tasks/mail');

app.use(cors());

app.post('/api/send', function (req, res) {

  var cusName = req.body.values;
  var options = {
    'cusName' : req.body.cusName,
    'cusMobileNo': req.body.cusMobileNo,
    'cusMail' : req.body.cusMail,
    'regarding': req.body.regarding,
    'content': req.body.content
  }
  debugger
  mail(options, function (error, info) {
    res.send({
      status: 'mail sent'
    });
  });
});

app.listen(3007, function () {
  console.log('Example app listening on port 3007!');
});