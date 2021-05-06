"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const oauth2_server_ts_1 = require("oauth2-server-ts");
function ExpressOAuthServer(options) {
    options = options || {};
    if (!options.model) {
        throw new oauth2_server_ts_1.InvalidArgumentError('Missing parameter: `model`');
    }
    this.useErrorHandler = options.useErrorHandler ? true : false;
    delete options.useErrorHandler;
    this.continueMiddleware = options.continueMiddleware ? true : false;
    delete options.continueMiddleware;
    this.server = new oauth2_server_ts_1.OAuth2Server(options);
}
ExpressOAuthServer.prototype.authenticate = function (options) {
    var that = this;
    return function (req, res, next) {
        var request = new oauth2_server_ts_1.Request(req);
        var response = new oauth2_server_ts_1.Response(res);
        return Promise.bind(that)
            .then(function () {
            return this.server.authenticate(request, response, options);
        })
            .tap(function (token) {
            res.locals.oauth = { token: token };
            next();
        })
            .catch(function (e) {
            return handleError.call(this, e, req, res, null, next);
        });
    };
};
ExpressOAuthServer.prototype.authorize = function (options) {
    var that = this;
    return function (req, res, next) {
        var request = new oauth2_server_ts_1.Request(req);
        var response = new oauth2_server_ts_1.Response(res);
        return Promise.bind(that)
            .then(function () {
            return this.server.authorize(request, response, options);
        })
            .tap(function (code) {
            res.locals.oauth = { code: code };
            if (this.continueMiddleware) {
                next();
            }
        })
            .then(function () {
            return handleResponse.call(this, req, res, response);
        })
            .catch(function (e) {
            return handleError.call(this, e, req, res, response, next);
        });
    };
};
ExpressOAuthServer.prototype.token = function (options) {
    var that = this;
    return function (req, res, next) {
        var request = new oauth2_server_ts_1.Request(req);
        var response = new oauth2_server_ts_1.Response(res);
        return Promise.bind(that)
            .then(function () {
            return this.server.token(request, response, options);
        })
            .tap(function (token) {
            res.locals.oauth = { token: token };
            if (this.continueMiddleware) {
                next();
            }
        })
            .then(function () {
            return handleResponse.call(this, req, res, response);
        })
            .catch(function (e) {
            return handleError.call(this, e, req, res, response, next);
        });
    };
};
var handleResponse = function (req, res, response) {
    if (response.status === 302) {
        res.cookie("accessToken", response.body.accessToken);
        var location = response.headers.location;
        delete response.headers.location;
        res.set(response.headers);
        res.redirect(location);
    }
    else {
        res.cookie("accessToken", response.body.accessToken);
        res.set(response.headers);
        res.status(response.status).send(response.body);
    }
};
var handleError = function (e, req, res, response, next) {
    if (this.useErrorHandler === true) {
        next(e);
    }
    else {
        if (response) {
            res.set(response.headers);
        }
        res.status(e.code);
        if (e instanceof oauth2_server_ts_1.UnauthorizedRequestError) {
            return res.send();
        }
        res.send({ error: e.name, error_description: e.message });
    }
};
exports.default = ExpressOAuthServer;
//# sourceMappingURL=index.js.map