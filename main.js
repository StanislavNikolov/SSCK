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

var users = [];

app.get("/results", function(req, res) {
	var output = "<table style=\"width:100%\"><tr>";
	for(var i in users)
		output += "<td>" + users[i].name + "</td>";
	output += "</tr><tr>";

	for(var i in users)
	{
		var result = 0;
		for(var j in users[i].task)
			result += users[i].task[j];
		console.log(users[i].name, result);

		output += "<td>" + result + "</td>";
	}

	output += "</tr></table>";
	res.send(output);
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

function addNewResult(name, task, strres)
{
	var res = 0;
	for(var i = 0;i < strres.length;++ i)
	{
		res *= 10;
		res += (strres[i]-'0');
	}

	for(var i in users)
	{
		if(name == users[i].name)
		{
			if(res > users[i].task[task])
				users[i].task[task] = res;
			return;
		}
	}
	var nu = {name:name, task:[]};
	nu.task[task] = res;
	users.push(nu);
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
			//res.setHeader('content-type', 'text/plain');
			var output = "";
			var lines = stdout.split("\n");
			for(var i = 0;i < lines.length;++ i)
			{
				if(lines[i] == "__SSCK_RES_PACK__")
					addNewResult(req.body.guysName, req.body.task, lines[++ i]);
				else
					output += lines[i] + "<br>";
			}
			res.send(output);
	});
});
