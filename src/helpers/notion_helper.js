const path = require('path');
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, './env/.env') });
const { Client } = require('@notionhq/client');
const logger = require('../log/logger');

const authorizeNotion = async () => {
	const notion = new Client({
		auth: process.env.NOTION_API_KEY
	});

	return notion;
};

const retrievePage = async (uuid, client) => {
	const response = await client.pages.retrieve({ page_id: uuid })

	return response;
};

const createNotionComment = async (uuid, client, msg) => {
	try {
		const response = await client.comments.create({
			parent: {
				page_id: uuid
			},
			rich_text: [
				{
					text: {
						content: msg,
					},
				},
			],
		});

		logger.info('Commentary created', response.parent);
	} catch (error) {
		logger.error('Error creating commentary', error);
	};
};

const formComment = async (email) => {
	msgText = `Заказчик проинформирован по поводу заключения договора по почтовому адресу: ${email}.`
	return msgText;
}

module.exports = { authorizeNotion, retrievePage, createNotionComment, formComment };
