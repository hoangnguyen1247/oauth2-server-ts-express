import util from 'util';
import redis from "redis";
import bluebird from 'bluebird';

const fmt = util.format;

/**
 * Redis formats.
 */
var formats = {
    client: 'clients:%s',
    token: 'tokens:%s',
    user: 'users:%s'
};

class Model {

    db;

    constructor() {
        this.db = bluebird.promisify(redis.createClient());
    }

    /**
     * Get access token.
     */
    getAccessToken = async (bearerToken) => {
        const token = await this.db.hgetall(fmt(formats.token, bearerToken));
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
        const client = await this.db.hgetall(fmt(formats.client, clientId));
        if (!client || client.clientSecret !== clientSecret) {
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
        const token = await this.db.hgetall(fmt(formats.token, bearerToken));
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
        const user = await this.db.hgetall(fmt(formats.user, username));
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
        const data = {
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            clientId: client.id,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            userId: user.id
        };

        this.db.hmset(fmt(formats.token, token.accessToken), data);
        this.db.hmset(fmt(formats.token, token.refreshToken), data);

        return data;
    };

}

export default Model;
