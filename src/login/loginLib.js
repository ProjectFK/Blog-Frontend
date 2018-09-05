const config = {
    loginurl: '//localhost:8000/login',
    uploadPayload: {
        cache: 'no-cache',
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        //TODO: SAME-ORIGIN IN PROUDCTION
        mode: 'cors'
    }
};

const exp = {
    validator: {
        username(username: String) {
            return !(username.length > 20 || username.length < 2);
        },
        password(password: String) {
            return /^(?=.*?[a-z])(?=.*?[0-9]).{8,20}$/.test(password);
        }
    },
    /**
     * When login is successful, server will send 301, since fetch is configured to follow redirection,
     * only unsuccessful login attempt will be processed
     * @param username
     * @param password
     * @param recaptcha_token
     * @returns {Promise<Response>}
     */
    attemptLogin(username: String, password: String, recaptcha_token: String): Promise<Response> {
        if (!(exp.validator.username(username) && exp.validator.password(password))) {
            debugger;
            throw new TypeError('invalidate username or password');
        }

        const payload = {
            name: username,
            password: password,
            recaptcha_token: recaptcha_token
        };

        return fetch(
            config.loginurl,
            Object.assign(
                {body: JSON.stringify(payload)},
                config.uploadPayload
            )
        )

    }
};


module.exports = exp;