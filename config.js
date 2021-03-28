module.exports = {
    // config used by MSAL
    msal_app: {
        auth: {
            clientId: '<client id>',
            authority: 'https://login.microsoftonline.com/<tenant id>/',
            clientSecret: '<client secret>',
        }
    },

    // Another config used by MSAL
    auth_param: {
        scopes: ['user.read'],
        redirectUri: 'http://localhost:3000/auth/callback',
    },

    // Specify groups that are allowed to access this app
    auth_groups: [
        '<group id>'
    ],

    // This key is used to encrypt session id
    session_key: '<a random long string>',

    // Port used by Express app
    port: 3000
}