import './style.css';

const sdk = require('../lib/KCIbald-blog-SDK');

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

function loginRequestFailed(failure) {
//    Exception logic
    console.log(failure);
}

function loginException(exception) {
    console.log(exception);
}

function reset() {
}

function loginSuccess(value: sdk.datastructures.Result) {
    window.location.replace('/');
}

function startLogin(token) {
    try {

        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        console.log(`login with user: ${username}, password: ${password}`);
        console.log(`recaptcha token: ${token}`);

        if (!sdk.validators.username(username)) {
            console.log(`user name: ${username} is invalidate`);
            return
        }

        if (!sdk.validators.password(password)) {
            console.log(`password: ${username} is invalidate`);
            return
        }

        sdk
            .loginApi.attemptLogin(username, password, token)
            .then(value => value.success ? loginSuccess(value) : loginRequestFailed(value))
            .catch(exception => loginException(exception))
            .finally(_ => reset())


    } catch (e) {
        //Recaptcha do not handle error from our callable
        console.error(e);
    }
}


//TODO: login logic