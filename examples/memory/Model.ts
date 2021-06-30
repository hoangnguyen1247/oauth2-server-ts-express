class InMemoryCache {

    clients;
    tokens;
    users;

    constructor() {
        this.clients = [{ clientId: 'thom', clientSecret: 'nightworld', redirectUris: [''] }];
        this.tokens = [];
        this.users = [{ id: '123', username: 'thomseddon', password: 'nightworld' }];
    }

    /*
    * Get access token.
    */
    getAccessToken = async (bearerToken) => {
        const tokens = this.tokens.filter(function (token) {
            return token.accessToken === bearerToken;
        });

        return tokens.length ? tokens[0] : false;
    };

    /**
     * Get refresh token.
     */
    getRefreshToken = async (bearerToken) => {
        const tokens = this.tokens.filter(function (token) {
            return token.refreshToken === bearerToken;
        });

        return tokens.length ? tokens[0] : false;
    };

    /**
     * Get client.
     */
    getClient = async (clientId, clientSecret) => {
        const clients = this.clients.filter(function (client) {
            return client.clientId === clientId && client.clientSecret === clientSecret;
        });

        return clients.length ? clients[0] : false;
    };

    /**
     * Save token.
     */
    saveToken = async (token, client, user) => {
        this.tokens.push({
            accessToken: token.accessToken,
            accessTokenExpiresAt: token.accessTokenExpiresAt,
            clientId: client.clientId,
            refreshToken: token.refreshToken,
            refreshTokenExpiresAt: token.refreshTokenExpiresAt,
            userId: user.id
        });
    };

    /*
    * Get user.
    */
    getUser = async (username, password) => {
        const users = this.users.filter(function (user) {
            return user.username === username && user.password === password;
        });

        return users.length ? users[0] : false;
    };
}

export default InMemoryCache;
