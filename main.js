var app = require("express")();
var cp = require("child_process").exec;

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var fs = require("fs");

var results = {};
app.get("/", function(req, res) {
	res.sendFile(__dirname+"/index.html");
});

app.get("/results", function(req, res) {
	//TODO
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
	if(req.body.guysName == undefined || req.body.guysName == "")
		req.body.guysName = "nobody";

	var dir = __dirname+"/uploadDir/"+req.body.guysName;

	if(fs.existsSync(dir) == false)
		fs.mkdirSync(dir);

	dir += ("/"+req.body.task);
	if(fs.existsSync(dir) == false)
		fs.mkdirSync(dir);

	var completeFileName = dir+"/"+randStr()+".cpp";
	fs.writeFile(completeFileName, req.body.sourceInput, function(err) {});

	console.log("Submission accepted by", req.body.guysName);
	cp(__dirname+"/compile.sh "+completeFileName+" "+req.body.task,
		function(err, stdout, stderr) {
			res.setHeader('content-type', 'text/plain');
			res.send(stdout);
	});
});
