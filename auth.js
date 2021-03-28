const Router = require('express').Router()
const msal = require('@azure/msal-node')
const axios = require('axios')
const config = require('./config.js')

// Create msal application object
const msal_app = new msal.ConfidentialClientApplication(config.msal_app)
const auth_param = config.auth_param

// Export Routing
module.exports = {
    router: Router,

    route() {
        this.router.get('/', async (req, res) => {
            try {
                // Get auth code url to sign user in
                let url = await msal_app.getAuthCodeUrl(auth_param)

                // Redirect user to MSAL
                // It will send auth code to redirectUri if user is in tenant
                // It will show error message if user not within tenant
                res.redirect(url)
            }
            catch (err) {
                res.status(500).send(err)
            }
        })

        this.router.get('/callback', async (req, res) => {
            try {
                // Get token using auth code
                let tokenRequest = { code: req.query.code, ...auth_param }
                let response = await msal_app.acquireTokenByCode(tokenRequest)
                let accessToken = response.accessToken

                // Get user groups
                let groups = await axios({
                    method: 'post',
                    url: 'https://graph.microsoft.com/v1.0/me/getMemberGroups',
                    headers: { Authorization: `Bearer ${accessToken}` },
                    data: { securityEnabledOnly: false }
                })

                // Set values into session
                req.session.groups = groups.data.value
                req.session.user = response.idTokenClaims.preferred_username

                // Ensure session is saved before redirecting
                req.session.save(function (err) {
                    if (!err) {
                        // Redirect user to original url (and delete it from cookie)
                        let originalUrl = req.session.originalUrl
                        delete req.session.originalUrl
                        res.redirect(originalUrl || '/')
                    }
                })
            }
            catch (err) {
                res.status(500).send(err)
            }
        })

        this.router.get('/logout', async (req, res) => {
            // Destroy user session
            req.session.destroy((err) => {
                if (!err){
                    res.status(200).send('Logged out successfully.')
                }
            })
        })

        return this.router
    }
}