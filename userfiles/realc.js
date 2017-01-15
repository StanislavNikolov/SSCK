var token = localStorage.getItem("authToken");

var submissions = {};
var logs = {};

var currentlyViewed = {};
var previewPanel = document.getElementById("submissionPreview");
var currOnPreviewPanel;

var task = getSelectedTask();
updateSubmitsList();

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
				var taskList = document.getElementsByName("task");
				fetchSubmitsList(taskList[0].value, updateSubmitsList);
				for(var i = 1;i < taskList.length;i ++) // var i in doesnt work
				{
					fetchSubmitsList(taskList[i].value, function(){});
				}

				setInterval(function()
						{
							var f1 = false;
							for(var i = 0;!f1 && i < submissions[task].length;i ++)
							{
								if(submissions[task][i].result == -1) f1 = true;
							}
							if(f1) fetchSubmitsList(task, updateSubmitsList);
						}, 500);
				setInterval(updateLogPreview, 500);
			}
		}
	};
}

function getSelectedTask()
{
	var taskList = document.getElementsByName("task");
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
	var inp = document.getElementById("codeInput");
	var code = inp.value;
	inp.value = "";

	if(submissions[task] == null) submissions[task] = [];
	submissions[task].push({id: 'automatic', result: -1});
	submissions[task].splice(0, Math.max(0, submissions[task].length - 10));

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
			fetchSubmitsList(task, updateSubmitsList);
		}
	};
}

function fetchSubmitsList(task, callback)
{
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

function handleTaskChange()
{
	task = getSelectedTask();
	refreshView(currentlyViewed[task], false);
	updateSubmitsList();
}

function updateSubmitsList()
{
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

		var value = (currentlyViewed[task] == submissions[task][i].id ? "close" : "open");
		var call = "handleSubmitLogClick(\"" + submissions[task][i].id + "\")";

		div.innerHTML = "<input type=\"button\" onclick=" + call + " value=\"" + value + "\">"
		+ "&nbsp;&nbsp;&nbsp;&nbsp;"
		+ "<b>" + submissions[task][i].result + "</b>";

		sl.appendChild(div);
	}
}

function handleSubmitLogClick(id)
{
	if(currentlyViewed[task] == id) currentlyViewed[task] = null;
	else currentlyViewed[task] = id;
	refreshView(currentlyViewed[task], true);
	updateSubmitsList();
}

function refreshView(id, force)
{
	if(id == null)
	{
		currOnPreviewPanel = id;
		previewPanel.innerHTML = "";
	}
	else if(id != currOnPreviewPanel || force)
	{
		currOnPreviewPanel = id;
		if(logs[id] == null) previewPanel.innerHTML = "<pre>Downloading log...</pre>";
		else previewPanel.innerHTML = "<pre>" + logs[id]; + "</pre>";
	}
}

function fetchLog(task, id, callback)
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
			if(request.responseText == 'x') return;
			if(logs[id] != request.responseText)
			{
				logs[id] = request.responseText;
				callback();
			}
		}
	};
}

function updateLogPreview()
{
	if(currentlyViewed[task] != null)
	{
		refreshView(currentlyViewed[task], false);

		var f2 = (logs[currentlyViewed[task]] == null);

		for(var i = 0;!f2 && i < submissions[task].length;i ++)
		{
			if(submissions[task][i].id == currentlyViewed[task])
			{
				if(submissions[task][i].result == -1)
				{
					f2 = true;
				}
				break;
			}
		}

		if(f2)
		{
			fetchLog(task, currentlyViewed[task], function()
					{
						refreshView(currentlyViewed[task], true);
					});
		}
	}
}
