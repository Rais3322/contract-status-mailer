const path = require('path');
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, './env/.env') });
const parse = require('./helpers/parse_helper');
const { Contract } = require('./db/db_models');
const { connectDB, addRecord, updateRecord, disconnectDB } = require('./helpers/db_helper');
const { authorizeGoogle, fetchGoogleSheetsValue } = require('./helpers/google_helper');
const { authorizeNotion, retrievePage } = require('./helpers/notion_helper');
const { sendContractInfo } = require('./helpers/mailing_helper');

const parseData = async (rawResponse, parseType) => {
	const rawValues = rawResponse.data.values;
	const parsedValues = [];
	for (const rawValue of rawValues) {
		const parsedValue = await parse[parseType](rawValue);
		parsedValues.push(parsedValue);
	};

	return parsedValues;
};

const handleContracts = async (contracts, notionClient) => {
	for (const contract of contracts) {
		if ((contract.uniqueField) && (contract.taskLink)) {
			const notionUUID = await parse.parseNotionLink(contract.taskLink);
			if (notionUUID) {
				const contractTask = await retrievePage(notionUUID, notionClient);
				const contractTaskNumber = await parse.parseNotionTaskNumber(contractTask);
				if(contractTaskNumber) {
					contract.taskNumber = contractTaskNumber;
					await addRecord(Contract, contract, 'uniqueField', async () => {
						console.log(`Contract № ${contract.contractNumber} added to DB`);
						await sendContractInfo('ndi@bal-inf.ru', contract);
					});
				};
			};
		};
		await updateRecord(Contract, contract, 'uniqueField');
	};
};

const main = async () => {
	const googleClient = await authorizeGoogle();
	const notionClient = await authorizeNotion();

	const fetchedContracts = await fetchGoogleSheetsValue(
		googleClient,
		process.env.CONTRACTS_SPREADSHEET,
		process.env.CONTRACTS_RANGE,
	);

	const parsedContracts = await parseData(fetchedContracts, 'parseContracts');

	await connectDB(process.env.DB_PATH);

	await handleContracts(parsedContracts, notionClient);

	await disconnectDB();

};

main();