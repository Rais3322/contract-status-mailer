const path = require('path');
const fs = require('fs/promises');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = path.resolve(__dirname, 'token.json');
const CREDENTIALS_PATH = path.resolve(__dirname, 'credentials.json');

const loadSavedCredentials = async () => {
	try {
		const content = await fs.readFile(TOKEN_PATH);
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials);
	} catch (error) {
		return null;
	};
};

const saveCredentials = async (client) => {
	const content = await fs.readFile(CREDENTIALS_PATH);
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: 'authorized_user',
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});
	await fs.writeFile(TOKEN_PATH, payload);
};

const authorize = async () => {
	let client = await loadSavedCredentials();
	if (client) {
		return client;
	};
	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	});
	if (client.credentials) {
		await saveCredentials(client);
	};
	return client;
};

const fetchGoogleSheetsValue = async (auth, spreadsheetId, range) => {
	const sheets = google.sheets({ version: 'v4', auth });
	try {
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: spreadsheetId,
			range: range,
		});
		// const numRows = response.data.values ? response.data.values.length : 0;
		// const result = {
		// 	response: response,
		// 	numRows: numRows
		// };
		return response;
	} catch (error) {
		//TODO: handling exception
		console.log(error.message);
		throw error;
	};
};

module.exports = { authorize, fetchGoogleSheetsValue }