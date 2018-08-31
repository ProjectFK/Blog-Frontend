let siteKey = '6LepWGkUAAAAAOuDkXsDYx5ohu-kas5-As7x047v';

window.onload = () => {
    grecaptcha.render('button', {
        'sitekey': siteKey,
        'callback': onRecaptchaTokenObtained
    });
};

var onRecaptchaTokenObtained = (token) => {
    alert(token);
};