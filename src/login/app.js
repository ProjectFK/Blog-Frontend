import './style.css';
var HmacSHA1 = require("crypto-js/hmac-sha1");

function getTimeStamp(){
	var seconds = Math.round(new Date().getTime() / 1000);
	return seconds;
}

var fakevap = "12345678";//a fake vaptcha challenge id,used before vaptch online

document.getElementById("login").onclick = function(){
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	var hash = HmacSHA1(username+password+getTimeStamp(),fakevap);
	var stringified = hash.toString();
	//ready to fetch here
	console.log(hash);
	console.log(stringified);
	//log fetch() information to be ready for next step and debug
};

console.log('app.js loaded!');

//TODO: login logic