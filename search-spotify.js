/**
 * This is an example of a basic node.js script that performs
 * the Client Credentials oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 */

var request = require('request') // "Request" library
require('dotenv').config()

var client_id = process.env.CLIENT_ID // Your client id
var client_secret = process.env.CLIENT_SECRET // Your secret

console.log(process.env.CLIENT_ID)

// your application requests authorization
var authOptions = {
	url: 'https://accounts.spotify.com/api/token',
	headers: {
		Authorization: 'Basic ' + new Buffer(client_id + ':' + client_secret).toString('base64'),
	},
	form: {
		grant_type: 'client_credentials',
	},
	json: true,
}

request.post(authOptions, function (error, response, body) {
	if (!error && response.statusCode === 200) {
		// use the access token to access the Spotify Web API
		var token = body.access_token
		var options = {
			url: 'https://api.spotify.com/v1/search?q=bts&type=track&include_external=audio&limit=50',
			headers: {
				Authorization: 'Bearer ' + token,
			},
			json: true,
		}
		request.get(options, function (error, response, body) {
			if (response.statusCode !== 200) {
				return
			}

			const musics = body.tracks.items.map(({ name, artists, href, album }) => ({
				name,
				artists,
				href,
				image: album.images,
			}))

			console.log(musics.map((m) => `${m.name} - ${m.artists[0].name}`))
		})
	}
})
