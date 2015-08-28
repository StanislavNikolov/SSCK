var app = require("express")();

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var fs = require("fs");

app.get('/', function(req, res) {
	  res.sendFile(__dirname+"/index.html");
});

var server = app.listen(3000, function() {
	  var host = server.address().address;
	  var port = server.address().port;

	  console.log("Starting server on http://%s:%s", host, port);
});

function randStr()
{
	  return Math.random().toString(36).substr(2, 5);
}

app.post("/", function(req, res) {
	  var dir = __dirname+"/uploadDir/"+req.body.guysName;

	  if(fs.existsSync(dir) == false)
		    fs.mkdirSync(dir);

	  dir += ("/"+req.body.task);
	  if(fs.existsSync(dir) == false)
		    fs.mkdirSync(dir);

	  var completeFileName = dir+"/"+randStr()+".cpp";
	  fs.writeFile(completeFileName, req.body.sourceInput, function(err) {
		    if(err)
		    {
				console.log(err);
				return;
		    }
		    console.log(completeFileName);
	  });

	  res.send("Submission received.");
});
