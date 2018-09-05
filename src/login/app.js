import './style.css';

const loginlib = require('./loginLib');

let siteKey = '6LepWGkUAAAAAOuDkXsDYx5ohu-kas5-As7x047v';

window.onload = () => {
    grecaptcha.render('login', {
        'sitekey': siteKey,
        'callback': startLogin
    });
};

document.onkeyup = (keyEvent) => {
    if (keyEvent.key === 'Enter')
        document.getElementById('login').click();
};

/**
 * @param serverResponse when server says it's an invalidate response
 * @param connectionException when there's connection error
 */
function loginRequestFailed(serverResponse, connectionException) {
//    Exception logic
    console.log(serverResponse);
    console.log(connectionException);
}

function startLogin(token) {
    try {

        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        console.log(`login with user: ${username}, password: ${password}`);
        console.log(`recaptcha token: ${token}`);

        if (!loginlib.validator.username(username)) {
            console.log(`user name: ${username} is invalidate`);
            return
        }

        if (!loginlib.validator.password(password)) {
            console.log(`password: ${username} is invalidate`);
            return
        }

        loginlib
            .attemptLogin(username, password, token)
            .then((value => loginRequestFailed(value, null)))
            .catch(exception => loginRequestFailed(null, exception))

    } catch (e) {
        //Recaptcha do not handle error from our callable
        console.error(e);
    }
}


//TODO: login logic