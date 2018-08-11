import './style.css';

const HmacSHA1 = require("crypto-js/hmac-sha1");

function getTimeStamp() {
    return Math.round(new Date().getTime() / 1000);
}

var fakevap = "12345678";//a fake vaptcha challenge id,used before vaptch online

document.getElementById("login").onclick = function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    var hash = HmacSHA1(username + password + getTimeStamp(), fakevap);
    var stringified = hash.toString();
    //ready to fetch here
    console.log(hash);
    console.log(stringified);
    //log fetch() information to be ready for next step and debug
};

console.log('app.js loaded!');

//TODO: login logic