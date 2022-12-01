import pgPromise from "pg-promise";

/**
 * Redis formats.
 */
var formats = {
    client: 'clients:%s',
    token: 'tokens:%s',
    user: 'users:%s'
};

class Model {

    pg;

    constructor() {
        this.pg = pgPromise(process.env.DATABASE_URL as any);
    }

    /**
     * Get access token.
     */
    getAccessToken = async (bearerToken) => {
        const token = await this.pg.query('SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE access_token = $1', [bearerToken])
        if (!token) {
            return;
        }

        return {
            accessToken: token.accessToken,
            clientId: token.clientId,
            expires: token.accessTokenExpiresOn,
            userId: token.userId
        };
    };

    /**
     * Get client.
     */
    getClient = async (clientId, clientSecret) =>{
        const result = await this.pg.query('SELECT client_id, client_secret, redirect_uri FROM oauth_clients WHERE client_id = $1 AND client_secret = $2', [clientId, clientSecret])
        const client = result.rows[0];

        if (!client) {
            return;
        }

        return {
            clientId: client.clientId,
            clientSecret: client.clientSecret
        };
    };

    /**
     * Get refresh token.
     */
    getRefreshToken = async (bearerToken) => {
        const result = await this.pg.query('SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE refresh_token = $1', [bearerToken])
        const token = result.rowCount ? result.rows[0] : null;
        if (!token) {
            return;
        }

        return {
            clientId: token.clientId,
            expires: token.refreshTokenExpiresOn,
            refreshToken: token.accessToken,
            userId: token.userId
        };
    };

    /**
     * Get user.
     */
    getUser = async (username, password) => {
        const result = await this.pg.query('SELECT id FROM users WHERE username = $1 AND password = $2', [username, password])
        const user= result.rowCount ? result.rows[0] : null;
        if (!user || password !== user.password) {
            return;
        }

        return {
            id: username
        };
    };

    /**
     * Save token.
     */
    saveToken = async (token, client, user) => {
        const result = await this.pg.query('INSERT INTO oauth_tokens(access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id) VALUES ($1, $2, $3, $4)', [
            token.accessToken,
            token.accessTokenExpiresOn,
            client.id,
            token.refreshToken,
            token.refreshTokenExpiresOn,
            user.id
        ]);
        const data = result.rowCount ? result.rows[0] : null; // TODO return object with client: {id: clientId} and user: {id: userId} defined

        return data;
    };

}

export default Model;
