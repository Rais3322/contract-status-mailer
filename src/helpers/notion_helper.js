const path = require('path');
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, './env/.env') });
const { Client } = require('@notionhq/client');

const authorizeNotion = async () => {
	const notion = new Client({
		auth: process.env.NOTION_API_KEY
	});

	return notion;
}

const retrievePage = async (uuid, client) => {
	const response = await client.pages.retrieve({ page_id: uuid })

	return response;
}

module.exports = { authorizeNotion, retrievePage };
