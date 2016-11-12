// TODO PLAINTEXT PASSWORD OVER HTTP ARE YOU FUCKING KIDDING ME FIX THIS SHIT
function submit()
{
	var u = document.getElementById("usernameInput");
	var p = document.getElementById("passwordInput");

	var request = new XMLHttpRequest();
	request.open("POST", "login/", true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send("username=" + encodeURIComponent(u.value)
			  + "&password=" + encodeURIComponent(p.value));

	request.onreadystatechange = function()
	{
		if(request.readyState == 4)
		{
			var response = decodeURIComponent(request.responseText);
			if(response == 'x') // something went wrong
			{
				console.log("Failed to login"); // TODO
				u.value = "";
				p.value = "";
			}
			else
			{
				localStorage.setItem("authToken", response);
				window.location = window.location.origin;
			}
		}
	};
}
