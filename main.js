var app = require("express")();
var cp = require("child_process").exec;
var config = require("./config.json");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if(config == undefined) { config = {}; }
if(config.users == undefined) { config.users = {} };
if(config.users.only_allowed == undefined) { config.users.only_allowed = false };
if(config.users.allowed_user_list == undefined) { config.users.allowed_user_list = []; };

var handlebars = require("handlebars");
var fs = require("fs");
var indexPage = "";

cp(__dirname + "/gen_tasklist.sh", function(err, stdout, stderr) {
	fs.readFile(stdout, "utf-8", function(error, json) {
		var data = JSON.parse(json);
		console.log(data);
		fs.readFile("template.html", "utf-8", function(error, source) {
			var template = handlebars.compile(source);
			indexPage = template(data);
		});
	});
});

var results = {};
app.get("/", function(req, res) {
	res.send(indexPage);
});

var users = [];
var tasks = [];
readResults();

app.get("/results", function(req, res) {
	saveResults();
	var output = "<center><table><caption><font size=10><b> RESULTS <b></font></caption><tr><th></th>";

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

	output += "<tr bgcolor=\"blue\"><th>total</th>";
	for(var i in users)
		output += "<th><font color=\"white\">" + users[i].total + "</font></th>";

	output += "</tr></table></center>";
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
	fs.writeFile(__dirname + "/results_tasks", JSON.stringify(tasks));
	fs.writeFile(__dirname + "/results_users", JSON.stringify(users));
}

function readResults()
{
	fs.readFile(__dirname + "/results_tasks", "utf8", function(err, data)
			{
				if(!err)
				{
					tasks = JSON.parse(data);
					return;
				}
				console.log(err);
			});
	fs.readFile(__dirname + "/results_users", "utf8", function(err, data)
			{
				if(!err)
				{
					users = JSON.parse(data);
					users.sort(function(u1, u2) { return u1.total < u2.total; } );
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
		if(strres[i] < '0' || strres[i] > '9')
		{
			console.log("[ERROR] Invalid result for task", task, "by", name, ": ", strres);
			console.log("There is probably an error in the checker for that task.");
			return;
		}
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
				users[i].total = 0;
				for(var j in users[i].results)
					users[i].total += users[i].results[j];
				users.sort(function(u1, u2) { return u1.total < u2.total; } );
				saveResults();
			}
			return;
		}
	}

	var nu = {name:name, results:{}, total: result};
	nu.results[task] = result;
	users.push(nu);

	saveResults();
}

app.post("/", function(req, res) {
	var username = req.body.guysName;

	if(config.users.only_allowed)
	{
		var isAllowed = false;
		for(var i in config.users.allowed_user_list)
		{
			if(username == config.users.allowed_user_list[i])
			{
				isAllowed = true;
				break;
			}
		}
		if(!isAllowed)
		{
			res.send("Username not whitelisted!<br>");
			return;
		}
	}

	if(username == undefined || username == "")
	{
		res.send("No username supplied!<br>");
		return;
	}

	// Remove illegal characters from the username
	for(var idx in req.body.guysName)
	{
		var chr = req.body.guysName[idx];
		if(!(chr >= 'a' && chr <= 'z') && !(chr >= 'A' && chr <= 'Z') && !(chr >= '0' && chr <= '9'))
		{
			res.send("Illegal character used!<br> This username looks better anyways: " + username.replace(/[^0-9a-zA-Z]/g, '_'));
			return;
		}
	}

	var dir = __dirname + "/submissions/" + username;

	if(fs.existsSync(__dirname + "/submissions") == false)
		fs.mkdirSync(__dirname + "/submissions");

	if(fs.existsSync(dir) == false)
		fs.mkdirSync(dir);

	dir += "/" + req.body.task;
	if(fs.existsSync(dir) == false)
		fs.mkdirSync(dir);

	var commitId = randStr();
	var completeFileName = dir + "/" + commitId + ".cpp"; // TODO generate more logical name (date, hash)
	fs.writeFile(completeFileName, req.body.sourceInput, function(err) {});

	console.log("[INFO]", new Date(), "Submission accepted by", username, "on task", req.body.task, "with id", commitId);

	var checker = "standard";
	if(config.checkers[req.body.task] !== undefined && config.checkers[req.body.task] !== "")
		checker = config.checkers[req.body.task];
	var command = __dirname + "/compile.sh " + completeFileName + " " + req.body.task + " " + checker;

	cp(command, function(err, stdout, stderr) {
		var output = "";
		var lines = stdout.split("\n");
		var result = 0;
		for(var i = 0;i < lines.length;++ i)
		{
			if(lines[i] == "__SSCK_RES_PACK__") // TODO documentation
			{
				i ++;
				result = lines[i];
				addNewResult(username, req.body.task, lines[i]);
			}
			else
				output += lines[i] + "<br>";
		}
		console.log("[INFO]", new Date(), "Submission with id", commitId, "got score", result);
		res.send(output);
	});
});
