let exp = {};

////////////////////////////BASIC DATA STRUCTURE////////////////////////////////

class User {
    id: number;
    username: string;

    constructor(id, name) {
        this.id;
        this.username = name;
    }
}

class Blog {
    id: number;
    content: string;
    author: User;
    modify_date: Date;
    created_date: Date;
    tag: string;

    constructor(id: number, content: string, author: User, modify_date: string, created_date: string, tag: string) {
        this.id = id;
        this.content = content;
        this.author = author;
        this.modify_date = new Date(modify_date);
        this.created_date = new Date(created_date);
        this.tag = tag;
    }

}

interface Result<T> extends RawResponseContainer {
    content?: T;
    success: boolean;
    exception?: ExceptionDescriber;
}

class ExceptionDescriber {
    isInternalError: boolean | true;
    exception_message: string;
}

interface RawResponseContainer {
    rawResponse: Response;
    body: any;
}

class IllegalArgumentException extends Error implements RawResponseContainer {
    constructor(message, response?: Result) {
        super(message);
        this.rawResponse = response.rawResponse;
        this.body = response.body;
    }
}

class NotFoundException extends Error implements RawResponseContainer {
    constructor(message, response: Result) {
        super(message);
        this.rawResponse = response.rawResponse;
        this.body = response.body;
    }
}


//////////////////////////////HELPER FUNCTIONS/////////////////////////////////////

async function extractResult(rawResponse: Response): Result {

    let body = await rawResponse.json();

    let value: Result = {
        success: body.state === 'success',
        content: body.result || null,
        rawResponse: rawResponse,
        body: body,
    };

    if (value.success) return value;

    value.exception = {};

    if (body.state_message === 'exception') {
        value.exception.exception_message = body.exception_msg;
    }

    if (rawResponse.status === 500
        || (value.success && body.state_message.toLowerCase().includes('internal error'))) {
        value.exception.isInternalError = true;
    }

    return value;
}

function isInternalError(value: Result): boolean {
    return value.exception ? value.exception.isInternalError : false;
}

///////////////////////////VALIDATORS//////////////////////////////////////////////

let doValidate = false;

class validators {
    static username(username: String) {
        return !doValidate || typeof username === 'string' && !(username.length > 20 || username.length < 2);
    }

    static userId(id: number) {
        return !doValidate || typeof id === 'number' && id > 0;
    }

    static password(password: String) {
        return !doValidate || typeof password === 'string' && /^(?=.*?[a-z])(?=.*?[0-9]).{8,20}$/.test(password);
    }

    static postId(id: number) {
        return !doValidate || typeof id === 'number' && id > 0;
    }
}

exp.validators = validators;

/////////////////////////LOGIN APIS////////////////////////////////////////////////

class loginAPIs {
    static async attemptLogin(name: string, password: string, token: string): Promise<Result<User>> {
        if ((!validators.username(name)) || (!validators.password(password)))
            throw new IllegalArgumentException('invalidate name or password');

        const payload = {
            name: name,
            password: password,
            recaptcha_token: token,
        };

        let response = await fetch(
            'api/login',
            {
                cache: 'no-cache',
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
                mode: 'same-origin'
            }
        );

        return extractResult(response);
    }
}

exp.loginApi = loginAPIs;

//////////////////////////////USER APIS////////////////////////////////////////////

class UserAPI {
    static async retrieveUserDataByID(id: number | String): Result<User> {
        if ((!typeof id === 'number' && validators.userId(id)) || (!typeof id === 'string' && validators.username(id)))
            throw new TypeError(`given id: ${id} do not match requirements`);
        let response = await fetch(
            `api/user/${id}`,
            {
                cache: 'no-cache',
                method: 'get',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'same-origin'
            }
        );

        let result = extractResult(response);

        if (response.status === 404 || result.body.message === 'Requested information not found')
            throw NotFoundException(response.exception_msg);

        return result;
    }
}

module.exports = exp;