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
var tasks = [];
readResults();

app.get("/results", function(req, res) {
	var output = "<table border=1 width=99%>";

	output += "<tr><th> </th>";
	for(var i in users)
		output += "<th>" + users[i].name + "</th>";
	output += "</tr>";

	for(var i in tasks)
	{
		output += "<tr><th>" + tasks[i] + "</th>";
		for(var j in users)
			if(users[j].results[tasks[i]] > 0)
				output += "<th>" + users[j].results[tasks[i]] + "</th>";
		output += "</tr>";
	}
	output += "</table>";
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

function saveResults()
{
	var tj = JSON.stringify(tasks);
	var uj = JSON.stringify(users);

	fs.writeFile(__dirname+"/results_tasks", tj, function(){});
	fs.writeFile(__dirname+"/results_users", uj, function(){});
}

function readResults()
{
	var tj, uj;
	fs.readFile(__dirname+"/results_tasks", "utf8", function(err, data)
	{
		if(err) { console.log(err); }
		tj=data;
		tasks = JSON.parse(tj);
	});
	fs.readFile(__dirname+"/results_users", "utf8", function(err, data)
	{
		if(err) { console.log(err); }
		uj=data;
		users = JSON.parse(uj);
	});
}

function addNewResult(name, task, strres)
{
	var res = 0;
	for(var i = 0;i < strres.length;++ i)
	{
		res *= 10;
		res += (strres[i]-'0');
	}

	var inTasks = false;
	for(var i in tasks)
	{
		if(tasks[i] == task)
			inTasks = true;
	}
	if(!inTasks)
		tasks.push(task);

	for(var i in users)
	{
		if(name == users[i].name)
		{
			if(users[i].results[task] == undefined || res > users[i].results[task])
				users[i].results[task] = res;
			return;
		}
	}
	var nu = {name:name, results:{}};
	nu.results[task] = res;
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
			saveResults();
	});
});
