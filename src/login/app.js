import './style.css';

let siteKey = '6LepWGkUAAAAAOuDkXsDYx5ohu-kas5-As7x047v';

window.onload = () => {
    grecaptcha.render('login', {
        'sitekey': siteKey,
        'callback': login
    });
};

function login(captcha){
	const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    console.log(username + "," + password);
    console.log(captcha);
    //log fetch() information to be ready for next step and debug
    fetch(
    	"http://localhost:8000/",
    	{
    		body: 'username='+username+'&password='+password,
    		cache: 'no-cache',
    		method: 'post',
    		mode: 'cors'
       	}
    ).then(function(response){return(response.text())}).then(html => console.log(html))}

console.log('app.js loaded!');

//TODO: login logic