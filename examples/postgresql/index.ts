import bodyParser from 'body-parser';
import express from 'express';
import oauthServer from 'oauth2-server-ts';

import Model from "./model";

// Create an Express application.
const app = express();

// Add body parser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add OAuth server.
app.oauth = oauthServer({
    model: new Model(),
});

// Post token.
app.post('/oauth/token', app.oauth.token());

// Get secret.
app.get('/secret', app.oauth.authorize(), function (req, res) {
    // Will require a valid accessToken.
    res.send('Secret area');
});

app.get('/public', function (req, res) {
    // Does not require an accessToken.
    res.send('Public area');
});

// Start listening for requests.
app.listen(3000);
