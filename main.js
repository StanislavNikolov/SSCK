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
	var output = "<center><table>";
	output += "<caption><font size=10><b> RESULTS <b></font></caption>";

	output += "<tr><th></th>";
	for(var i in users)
		output += "<th bgcolor=\"black\" width=100><font size=5 color=\"white\">" + users[i].name + "</font></th>";
	output += "</tr>";

	var colors = ["#6d6c6c", "#898989"];

	for(var i in tasks)
	{
		output += "<tr bgcolor="+colors[i%colors.length]+"><th>" + tasks[i] + "</th>";
		for(var j in users)
		{
			if(users[j].results[tasks[i]] == undefined)
				users[j].results[tasks[i]] = 0;
			output += "<th><font color=\"white\">" + users[j].results[tasks[i]] + "</font></th>";
		}
		output += "</tr>";
	}
	output += "</table></center>";
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
	fs.writeFile(__dirname+"/results_tasks", JSON.stringify(tasks));
	fs.writeFile(__dirname+"/results_users", JSON.stringify(users));
}

function readResults()
{
	fs.readFile(__dirname+"/results_tasks", "utf8", function(err, data)
	{
		if(!err)
		{
			tasks = JSON.parse(data);
			return;
		}
		console.log(err);
	});
	fs.readFile(__dirname+"/results_users", "utf8", function(err, data)
	{
		if(!err)
		{
			users = JSON.parse(data);
			return;
		}
		console.log(err);
	});
}

function addNewResult(name, task, strres)
{
	// Parse the string to int
	var result = 0;
	for(var i = 0;i < strres.length;++ i)
	{
		result *= 10;
		result += (strres[i]-'0');
	}

	var inTasks = false;
	for(var i in tasks)
	{
		if(tasks[i] == task)
		{
			inTasks = true;
			break;
		}
	}

	if(!inTasks)
	{
		tasks.push(task);
		tasks.sort();
	}

	for(var i in users)
	{
		if(name == users[i].name)
		{
			if(users[i].results[task] == undefined || result > users[i].results[task])
			{
				users[i].results[task] = result;
				saveResults();
			}
			return;
		}
	}

	var nu = {name:name, results:{}};
	nu.results[task] = result;
	users.push(nu);

	saveResults();
}

app.post("/", function(req, res) {
	if(req.body.guysName == undefined || req.body.guysName == "")
		req.body.guysName = "nobody";

	var dir = __dirname+"/uploadDir/"+req.body.guysName;

	if(fs.existsSync(__dirname+"/uploadDir") == false)
		fs.mkdirSync(__dirname+"/uploadDir");

	if(fs.existsSync(dir) == false)
		fs.mkdirSync(dir);

	dir += ("/"+req.body.task);
	if(fs.existsSync(dir) == false)
		fs.mkdirSync(dir);

	var commitId = randStr();
	var completeFileName = dir+"/"+commitId+".cpp";
	fs.writeFile(completeFileName, req.body.sourceInput, function(err) {});

	console.log("Submission accepted by", req.body.guysName, "on task", req.body.task, "with id", commitId);
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
	});
});
