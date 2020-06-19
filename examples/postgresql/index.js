
/**
 * Module dependencies.
 */

var bodyParser = require('body-parser');
var express = require('express');
var oauthServer = require('express-oauth-server');
var render = require('co-views')('views');
var util = require('util');

// Create an Express application.
var app = express();

// Add body parser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add OAuth server.
app.oauth = oauthServer({
    model: require('./model')
});

// Post token.
app.post('/oauth/token', app.oauth.token());

// Get authorization.
app.get('/oauth/authorize', function (req, res) {
    // Redirect anonymous users to login page.
    if (!req.app.locals.user) {
        return res.redirect(util.format('/login?redirect=%s&clientId=%s&redirectUri=%s', req.path, req.query.clientId, req.query.redirectUri));
    }

    return render('authorize', {
        clientId: req.query.clientId,
        redirectUri: req.query.redirectUri
    });
});

// Post authorization.
app.post('/oauth/authorize', function (req, res) {
    // Redirect anonymous users to login page.
    if (!req.app.locals.user) {
        return res.redirect(util.format('/login?clientId=%s&redirectUri=%s', req.query.clientId, req.query.redirectUri));
    }

    return app.oauth.authorize();
});

// Get login.
app.get('/login', function (req) {
    return render('login', {
        redirect: req.query.redirect,
        clientId: req.query.clientId,
        redirectUri: req.query.redirectUri
    });
});

// Post login.
app.post('/login', function (req, res) {
    // @TODO: Insert your own login mechanism.
    if (req.body.email !== 'thom@nightworld.com') {
        return render('login', {
            redirect: req.body.redirect,
            clientId: req.body.clientId,
            redirectUri: req.body.redirectUri
        });
    }

    // Successful logins should send the user back to /oauth/authorize.
    var path = req.body.redirect || '/home';

    return res.redirect(util.format('/%s?clientId=%s&redirectUri=%s', path, req.query.clientId, req.query.redirectUri));
});

// Get secret.
app.get('/secret', app.oauth.authenticate(), function (req, res) {
    // Will require a valid accessToken.
    res.send('Secret area');
});

app.get('/public', function (req, res) {
    // Does not require an accessToken.
    res.send('Public area');
});

// Start listening for requests.
app.listen(3000);
