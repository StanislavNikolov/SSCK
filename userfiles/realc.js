var token = localStorage.getItem("authToken");
var validToken = true;
var submissions = {};
var currentlyViewed = "";
var logs = {};

if(token == null)
{
	window.location = window.location.origin + "/login";
}
else
{
	var request = new XMLHttpRequest();
	request.open("POST", "tokenStatus/", true); // check if the token is still valid
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send("token=" + encodeURIComponent(token));
	request.onreadystatechange = function()
	{
		if(request.readyState == 4)
		{
			if(request.responseText != "o") // the token we have is not valid
			{
				window.location = window.location.origin + "/login";
			}
			else
			{
				validToken = true;
			}
		}
	};
}

function getSelectedTask()
{
	var taskList = document.getElementsByName("task");
	var task = "";
	for(var i in taskList)
	{
		if(taskList[i].checked) // TODO will break if the layout changes
		{
			return taskList[i].value;
		}
	}
	// just select the first one
	taskList[0].checked = true;
	return taskList[0].value;
}

function sendCode()
{
	if(!validToken) return;

	var inp = document.getElementById("codeInput");
	var code = inp.value;
	inp.value = "";

	var task = getSelectedTask();

	if(submissions[task] == null) submissions[task] = [];
	submissions[task].push({id: 'automatic', result: -1});

	var request = new XMLHttpRequest();
	request.open("POST", "/", true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send("token=" + encodeURIComponent(token)
			  + "&task=" + encodeURIComponent(task)
			  + "&code=" + encodeURIComponent(code));

	request.onreadystatechange = function()
	{
		if(request.readyState == 4)
		{
			updateSubmitsPage();
		}
	};
}

function getSubmitsList(task, callback)
{
	if(!validToken) return;

	var request = new XMLHttpRequest();
	request.open("POST", "/getsubmlist", true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send("token=" + encodeURIComponent(token)
			  + "&task=" + encodeURIComponent(task));

	request.onreadystatechange = function()
	{
		if(request.readyState == 4)
		{
			var res = request.responseText; // note: not uri encoded!
			if(res == 'x') return;
			if(res != JSON.stringify(submissions[task])) {
				submissions[task] = JSON.parse(res);
				callback();
			}
		}
	};
}

function updateSubmitsPage()
{
	var task = getSelectedTask();
	var sl = document.getElementById("submissionsList");

	while(sl.firstChild) sl.removeChild(sl.firstChild);

	for(var i in submissions[task])
	{
		var div = document.createElement("div");
		div.id = "subm_" + submissions[task][i].id;

		var status = "partial";
		if(submissions[task][i].result == -1) status = "testing";
		else if(submissions[task][i].result == 0) status = "wrong";
		else if(submissions[task][i].result == 100) status = "ok";
		div.className = "submission " + status;

		var call = "view(\"" + task + "\",\"" + submissions[task][i].id + "\")";
		div.innerHTML = "<input type=\"button\" onclick=" + call + " value=\"open\">"
		+ "&nbsp;&nbsp;&nbsp;&nbsp;"
		+ "<b>" + submissions[task][i].result + "</b>";

		sl.appendChild(div);
	}
}

function view(task, id)
{
	var panel = document.getElementById("submissionPreview");

	if(currentlyViewed == id) // close the log box
	{
		currentlyViewed = "";
		panel.innerHTML = "";
		document.getElementById("subm_" + id).children[0].value = "open";
		return;
	}

	try
	{
		document.getElementById("subm_" + id).children[0].value = "close";
		document.getElementById("subm_" + currentlyViewed).children[0].value = "open";
	}
	catch(err) { }
	currentlyViewed = id;

	if(logs[id] == null) logs[id] = "unavailable";
	panel.innerHTML = "<pre>" + logs[id]; + "</pre>";
}

function refreshView(id)
{
	var panel = document.getElementById("submissionPreview");
	if(logs[id] == null) logs[id] = "unavailable";
	panel.innerHTML = "<pre>" + logs[id]; + "</pre>";
}

function getLog(task, id, callback)
{
	var request = new XMLHttpRequest();
	request.open("POST", "/getlog", true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send("token=" + encodeURIComponent(token)
			+ "&task=" + encodeURIComponent(task)
			+ "&id=" + encodeURIComponent(id));

	request.onreadystatechange = function()
	{
		if(request.readyState == 4)
		{
			logs[id] = decodeURIComponent(request.responseText);
			callback();
		}
	};
}

function updateSubmitPreview()
{
	if(currentlyViewed != "")
	{
		getLog(getSelectedTask(), currentlyViewed, function()
				{
					refreshView(currentlyViewed);
				});
	}
}

setInterval(function() { getSubmitsList(getSelectedTask(), updateSubmitsPage); }, 600);
setInterval(updateSubmitPreview, 1000);
