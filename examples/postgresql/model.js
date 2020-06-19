
/**
 * Module dependencies.
 */

var pg = require('pg-promise')(process.env.DATABASE_URL);

/*
 * Get access token.
 */

module.exports.getAccessToken = function (bearerToken) {
    return pg.query('SELECT accessToken, accessTokenExpiresOn, clientId, refreshToken, refreshTokenExpiresOn, userId FROM oauth_tokens WHERE accessToken = $1', [bearerToken])
        .then(function (result) {
            var token = result.rows[0];

            return {
                accessToken: token.accessToken,
                client: { id: token.clientId },
                expires: token.expires,
                user: { id: token.userId }, // could be any object
            };
        });
};

/**
 * Get client.
 */

module.exports.getClient = function* (clientId, clientSecret) {
    return pg.query('SELECT clientId, clientSecret, redirectUri FROM oauth_clients WHERE clientId = $1 AND clientSecret = $2', [clientId, clientSecret])
        .then(function (result) {
            var oAuthClient = result.rows[0];

            if (!oAuthClient) {
                return;
            }

            return {
                clientId: oAuthClient.clientId,
                clientSecret: oAuthClient.clientSecret,
                grants: ['password'], // the list of OAuth2 grant types that should be allowed
            };
        });
};

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = function* (bearerToken) {
    return pg.query('SELECT accessToken, accessTokenExpiresOn, clientId, refreshToken, refreshTokenExpiresOn, userId FROM oauth_tokens WHERE refreshToken = $1', [bearerToken])
        .then(function (result) {
            return result.rowCount ? result.rows[0] : false;
        });
};

/*
 * Get user.
 */

module.exports.getUser = function* (username, password) {
    return pg.query('SELECT id FROM users WHERE username = $1 AND password = $2', [username, password])
        .then(function (result) {
            return result.rowCount ? result.rows[0] : false;
        });
};

/**
 * Save token.
 */

module.exports.saveAccessToken = function* (token, client, user) {
    return pg.query('INSERT INTO oauth_tokens(accessToken, accessTokenExpiresOn, clientId, refreshToken, refreshTokenExpiresOn, userId) VALUES ($1, $2, $3, $4)', [
        token.accessToken,
        token.accessTokenExpiresOn,
        client.id,
        token.refreshToken,
        token.refreshTokenExpiresOn,
        user.id
    ]).then(function (result) {
        return result.rowCount ? result.rows[0] : false; // TODO return object with client: {id: clientId} and user: {id: userId} defined
    });
};
