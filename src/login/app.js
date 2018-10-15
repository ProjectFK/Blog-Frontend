import './style.css';

const sdk = require('../lib/KCIbald-blog-SDK');
const alertlib = require('../lib/alertlib');

let siteKey = '6LepWGkUAAAAAOuDkXsDYx5ohu-kas5-As7x047v';
let location = window.location.href;


window.onload = () => {
    grecaptcha.render('login', {
        'sitekey': siteKey,
        'callback': startLogin,
        'expired-callback':recap_expired,
        'error-callback':recap_error
    });
    if(window.location.href.includes("?wrongpas=True")){
        alertlib.user_err("Invalid password.")
    }
};

document.onkeyup = (keyEvent) => {
    if (keyEvent.key === 'Enter')
        document.getElementById('login').click();
};

function recap_expired() {
    alertlib.user_err("")
}

function recap_error() {
    alertlib.user_err("Internet failed! Please check your Internet.")
}

function loginRequestFailed(failure) {
//    Exception logic
    alertlib.user_err("Wrong username or password!");
    console.log(failure);
    window.location = "http://127.0.0.1:8080/login?wrongpas=True"
}

function loginException(exception) {
    alertlib.unexpected_err('3333');
    console.log(exception);
}

function reset() {
    window.location.reload()
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


    } catch (e) {
        //Recaptcha do not handle error from our callable
        layer.alert('见到你真的很高兴', {icon: 2});
        console.error(e);
    }
}


//TODO: login logic