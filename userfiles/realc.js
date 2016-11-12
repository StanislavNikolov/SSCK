var token = localStorage.getItem("authToken");

if(token == null)
{
	window.location = window.location.origin + "/login";
}
else
{
	var request = new XMLHttpRequest();
	request.open("POST", "tokenStatus/", true); // check if the token is still valid
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send("token=" + token);
	request.onreadystatechange = function()
	{
		if(request.readyState == 4)
		{
			console.log(request.responseText);
			if(request.responseText != "o") // the token we have is not valid
			{
				window.location = window.location.origin + "/login";
			}
		}
	};
}
