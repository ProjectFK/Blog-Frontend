import './style.css';

var loginbut = document.getElementById("login");

loginbut.setAttribute('data-callback','login');

function login(captcha){
	const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log(username + "," + password);
    console.log(captcha)
    //log fetch() information to be ready for next step and debug
}

console.log('app.js loaded!');

//TODO: login logic