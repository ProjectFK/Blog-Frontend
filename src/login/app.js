import './style.css';

let siteKey = '6LepWGkUAAAAAOuDkXsDYx5ohu-kas5-As7x047v';

window.onload = () => {
    grecaptcha.render('login', {
        'sitekey': siteKey,
        'callback': login
    });
};

document.onkeyup = (e) => {
    var event = e || window.event;
    var key = event.which || event.keyCode || event.charCode;
    if (key == 13) {
        document.getElementById('login').click();
    }
};


function loginprocess(responsetext){
    //process after got the response
    console.log(responsetext);
}

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
    ).then(function(response){return(response.text())})
    .then(text => loginprocess(text))}

console.log('app.js loaded!');

//TODO: login logic