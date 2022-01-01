var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var cors = require("cors");
var fs = require("fs");
var shell = require("shelljs");
var glob = require("glob");
app.use(express.static("public"));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  //Enabling CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,   Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  next();
});

app.post("/api/create", function (req, res) {
  var theatreName = req.body.theatreName;
  var options = [
    {
      title: req.body.title,
      category: req.body.category,
      summary: req.body.summary,
      status: req.body.status,
      createdBy: req.body.createdBy,
      updatedBy: req.body.updatedBy,
      date: new Date(),
    },
  ];
  var countJson = JSON.parse(fs.readFileSync("./incidents/count.json"));
  var incidentId = countJson.count + 1;
  var path = "./incidents/" + theatreName;
  if (!fs.existsSync(path)) {
    shell.mkdir("-p", path);
    shell.mkdir("-p", path + "/open");
    shell.mkdir("-p", path + "/closed");
    shell.mkdir("-p", path + "/deleted");
    fs.writeFileSync(
      path + "/open/" + incidentId + ".json",
      JSON.stringify(options, null, 4),
      "utf-8"
    );
  } else {
    fs.writeFileSync(
      path + "/open/" + incidentId + ".json",
      JSON.stringify(options, null, 4),
      "utf-8"
    );
  }
  countJson.count = incidentId;
  fs.writeFileSync(
    "./incidents/count.json",
    JSON.stringify(countJson, null, 4),
    "utf-8"
  );
  res.send({
    id: incidentId,
    message: "incident created",
  });
});

app.post("/api/update", function (req, res) {
  var theatreName = req.body.theatreName;
  var incidentId = req.body.incidentId;

  var fileContent = JSON.parse(
    fs.readFileSync(
      "./incidents/" + theatreName + "/open/" + incidentId + ".json"
    )
  );

  var options = {
    summary: req.body.summary,
    updatedBy: req.body.updatedBy,
    date: new Date(),
  };

  fileContent.push(options);

  var path = "./incidents/" + theatreName;
  fs.writeFileSync(
    path + "/open/" + incidentId + ".json",
    JSON.stringify(fileContent, null, 4),
    "utf-8"
  );

  res.send({
    id: incidentId,
    message: "incident Updated",
  });
});

app.listen(3007, function () {
  console.log("Example app listening on port 3007!");
});

// const allowCors = fn =&gt; async (req, res) =&gt; {
//   res.setHeader('Access-Control-Allow-Credentials', true)
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   // another common pattern
//   // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
//   res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
//   )
//   if (req.method === 'OPTIONS') {
//     res.status(200).end()
//     return
//   }
//   return await fn(req, res)
// }

// const handler = (req, res) =&gt; {
//   const d = new Date()
//   res.end(d.toString())
// }

// module.exports = allowCors(handler)
