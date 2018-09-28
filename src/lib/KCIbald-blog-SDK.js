const config = require('./SDK-Config');

const exp = {};

////////////////////////////BASIC DATA STRUCTURE////////////////////////////////

/**
 {
        "id": 1,
        "username": "someone"
   }
 */

class User {
    id: number;
    username: string;

    constructor(id, name) {
        this.id;
        this.username = name;
    }
}

/**

 {
        "id": 1,
        "author": {
            "id": 1,
            "username": "someone"
        },
        "title": "loool",
        "content": "",
        "modifyDate": "2018-09-20T18:51:00.190972",
        "createdDate": "2018-09-20T18:51:00.190972",
        "tag": "tech"
    }

 */

class Blog {
    id: number;
    author: User;
    title: string;
    content: string;
    modify_date: Date;
    created_date: Date;
    tag: Tag;

    /**
     * Use this constructor for construct blog object for uploading
     * @param content
     * @param title
     * @param tag
     */
    constructor(
        content: string,
        title: String,
        tag: Tag
    ) {
        this.content = content;
        this.title = title;
        this.tag = tag;
    }

}

type Tag = "life" | "tech";

/**
 {
        "state": "success",
        "result": {}
    }
 */
interface Result<T> extends RawResponseContainer {
    content?: T;
    success: boolean;
    exception?: ExceptionDescriber;
    location?: string;
    state_message: string;
}

class ExceptionDescriber {
    isInternalError: boolean;
    isPermissionDenied: boolean;

    constructor() {
        this.isInternalError = false;
        this.isPermissionDenied = false;
    }

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

class ForbiddenException extends Error implements RawResponseContainer {
    constructor(message, response: Result) {
        super(message);
        this.rawResponse = response.rawResponse;
        this.body = response.body;
    }
}

class InternalError extends Error {
    response: Response;

    constructor(message, response: Response) {
        super(message);
        this.response = response;
        try {
            console.error(this);
            let body = response.body.getReader().read();
            console.error("Response body: " + body)
        } catch (e) {
        }
    }
}


//////////////////////////////HELPER FUNCTIONS/////////////////////////////////////

async function extractResultJson(rawResponse: Response): Result {

    let contentType = rawResponse.headers.get("content-type");
    if (!contentType || !contentType.toLowerCase().includes("json"))
        throw InternalError("invalid server response, expect content type json, received: " + contentType);

    let body = await rawResponse.json();

    let value: Result = {
        success: body.state === 'success',
        content: body.result || null,
        rawResponse: rawResponse,
        body: body,
    };

    if (value.success) {
        if (!value.state_message) value.state_message = 'success';
        return value;
    }

    value.exception = new ExceptionDescriber();

    if (body.state_message === 'exception') {
        value.exception.exception_message = body.exception_msg;
    }

    if (rawResponse.status === 500
        || (!value.success && body.state_message === 'Internal Error')) {
        value.exception.isInternalError = true;
    }

    if (rawResponse.status === 403 || !value.success)
        if (value.message === 'Forbidden' || value.message === 'Not Authorized')
            throw ForbiddenException(value.message);

    return value;
}

function isInternalError(value: Result): boolean {
    return value.exception ? value.exception.isInternalError : false;
}

function throwIfNotFound(result, response) {
    if (!result.success && (response.status === 404 || result.body.message === 'Requested information not found'))
        throw NotFoundException(response.exception_msg);
}

///////////////////////////VALIDATORS//////////////////////////////////////////////

class validators {
    static username(username: String) {
        return !config.doValidate || typeof username === 'string' && !(username.length > 20 || username.length < 2);
    }

    static userId(id: number) {
        return !config.doValidate || typeof id === 'number' && id > 0;
    }

    static password(password: String) {
        return !config.doValidate || typeof password === 'string' && /^(?=.*?[a-z])(?=.*?[0-9]).{8,20}$/.test(password);
    }

    static postId(id: number) {
        return !config.doValidate || typeof id === 'number' && id > 0;
    }
}


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
            config.fetchRequestConfigs('post', payload),
        );

        return extractResultJson(response);
    }
}


//////////////////////////////USER APIS////////////////////////////////////////////

class UserAPI {
    static async retrieveUserDataByID(id: number | String): Promise<Result<User>> {
        if ((validators.userId(id)) || (validators.username(id)))
            throw new TypeError(`given id: ${id} do not match requirements`);

        let response = await fetch(
            `api/user/${id}`,
            config.fetchRequestConfigs(),
        );

        let result = extractResultJson(response);

        throwIfNotFound(result, response);

        return result;
    }
}

///////////////////////////////////////////////////////////////////////////////////

function inspectBlogObj(blog: Blog) {
    if (!(blog.title && blog.content && blog.tag))
        throw TypeError('Unsatisfied object, something is missing! Use constructor!')
}

class BlogAPI {
    static async retrieveAllBlogs(): Promise<Result<Array<Blog>>> {
        return await fetch(
            'api/blog/',
            config.fetchRequestConfigs(),
        );
    }

    static async retrieveBlogDataByID(id: number): Promise<Result<Blog>> {
        if (validators.postId(id))
            throw new TypeError(`given id: ${id} do not match requirements`);

        let response = await fetch(
            `api/blog/${id}`,
            config.fetchRequestConfigs(),
        );

        let result = extractResultJson(response);

        throwIfNotFound(result);

        return result;
    }

    /**
     * @param blog created via Blog's constructor (only content, title, tag is filled)
     *  Example:
     *  {
            "content": "",
            "title": "loool",
            "tag": "tech"
        }

     * @returns {Promise<void>}
     * Example:
     *  {
            "state": "success",
            "state_message": "created",
            "location": "/blog/1",
            "result": {
                "id": 1,
                "author": {
                    "id": 1,
                    "username": "someone"
                },
                "title": "loool",
                "content": "",
                "modifyDate": "2018-09-20T18:51:00.1909715",
                "createdDate": "2018-09-20T18:51:00.1909715",
                "tag": "tech"
            }
        }
     */
    static async uploadBlog(blog: Blog): Promise<Result<Blog>> {
        if (blog.id || blog.author)
            throw TypeError('upload blog should not contain id or author, construct it using default constructor');
        inspectBlogObj(blog);
        let response = await fetch(
            'api/blog/',
            config.fetchRequestConfigs('get', blog)
        );

        return extractResultJson(response);
    }

    static async updateBlog(id: number, target: Blog): Promise<Result> {
        inspectBlogObj(target);
        let response = await fetch(
            `api/blog/${target.id}`,
            config.fetchRequestConfigs('put', target)
        );

        return extractResultJson(response)
    }

    static async deleteBlog(id: number): Promise<Result> {
        if (!validators.postId(id))
            throw new TypeError(`given id: ${id} do not match requirements`);

        let response = await fetch(
            `api/blog/${id}`,
            config.fetchRequestConfigs('delete')
        );

        return extractResultJson(response)
    }

}

exp.validators = validators;
exp.loginApi = loginAPIs;
exp.blogAPI = BlogAPI;

module.exports = exp;