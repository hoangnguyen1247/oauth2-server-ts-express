import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

mongoose.model('OAuthTokens', new Schema({
    accessToken: { type: String },
    accessTokenExpiresOn: { type: Date },
    client: { type: Object },  // `client` and `user` are required in multiple places, for example `getAccessToken()`
    clientId: { type: String },
    refreshToken: { type: String },
    refreshTokenExpiresOn: { type: Date },
    user: { type: Object },
    userId: { type: String },
}));

mongoose.model('OAuthClients', new Schema({
    clientId: { type: String },
    clientSecret: { type: String },
    redirectUris: { type: Array }
}));

mongoose.model('OAuthUsers', new Schema({
    email: { type: String, default: '' },
    firstname: { type: String },
    lastname: { type: String },
    password: { type: String },
    username: { type: String }
}));

const OAuthTokensModel = mongoose.model('OAuthTokens');
const OAuthClientsModel = mongoose.model('OAuthClients');
const OAuthUsersModel = mongoose.model('OAuthUsers');

class Model {

    /**
     * Get access token.
     */
    getAccessToken = async (bearerToken) => {
        const token: any = OAuthTokensModel.findOne({ accessToken: bearerToken }).lean();
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
    getClient = async (clientId, clientSecret) => {
        const client: any = OAuthClientsModel.findOne({ clientId: clientId, clientSecret: clientSecret }).lean();
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
        const token: any = OAuthTokensModel.findOne({ refreshToken: bearerToken }).lean();
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
        const user: any = OAuthUsersModel.findOne({ username: username, password: password }).lean();
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
        var accessToken = new OAuthTokensModel({
            accessToken: token.accessToken,
            accessTokenExpiresOn: token.accessTokenExpiresOn,
            client: client,
            clientId: client.clientId,
            refreshToken: token.refreshToken,
            refreshTokenExpiresOn: token.refreshTokenExpiresOn,
            user: user,
            userId: user._id,
        });
        // Can't just chain `lean()` to `save()` as we did with `findOne()` elsewhere. Instead we use `Promise` to resolve the data.
        const saveResult: any = await new Promise(function (resolve, reject) {
            accessToken.save(function (err, data) {
                if (err) reject(err);
                else resolve(data);
            });
        });
        var data: any = new Object();
        for (var prop in saveResult) data[prop] = saveResult[prop];

        data.client = data.clientId;
        data.user = data.userId;

        return data;
    };

}

export default Model;
