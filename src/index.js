const path = require('path');
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, './env/.env') });
const parse = require('./helpers/parse_helper');
const { Customer, Contract } = require('./db/db_models');
const { connectDB, addRecord, updateRecord, disconnectDB, retrieveRecord } = require('./helpers/db_helper');
const { authorize, fetchGoogleSheetsValue, sendGmailMessage } = require('./helpers/google_helper');

const parseData = async (rawResponse, parseType) => {
	const rawValues = rawResponse.data.values;
	const parsedValues = [];
	for (const rawValue of rawValues) {
		const parsedValue = await parse[parseType](rawValue);
		parsedValues.push(parsedValue);
	};

	return parsedValues;
};

const sendContractInfo = async (dst) => {
	const sourceEmail = process.env.GMAIL_USER;
	const desinationEmail = dst;
	const subject = 'Информирование по заключенному договору на оказание услуг';
	const messge = `Sample text`;

	sendGmailMessage(sourceEmail, desinationEmail, subject, messge);
}

const main = async () => {
	const googleClient = await authorize();

	const [fetchedContracts, fetchedCustomers] = await Promise.all([
		fetchGoogleSheetsValue(
			googleClient,
			process.env.CONTRACTS_SPREADSHEET,
			'Договора 2023!A5:L'
		),
		fetchGoogleSheetsValue(
			googleClient,
			process.env.CUSTOMERS_SPREADSHEET,
			'ЛИЦЕНЗИИ!C2:F'
		)
	]);

	const [parsedContracts, parsedCustomers] = await Promise.all([
		parseData(fetchedContracts, 'parseContracts'),
		parseData(fetchedCustomers, 'parseCustomers')
	]);

	const mergedCustomers = await parse.mergeCustomers(parsedCustomers);

	await connectDB(process.env.DB_PATH);

	for (const parsedContract of parsedContracts) {
		await addRecord(Contract, parsedContract, 'uniqueField', () => {

		});
		await updateRecord(Contract, parsedContract, 'uniqueField');
	};
	for (const mergedCustomer of mergedCustomers) {
		await addRecord(Customer, mergedCustomer, 'ITN');
		await updateRecord(Customer, mergedCustomer, 'ITN');
	};

	await disconnectDB();

	sendContractInfo('ndi@bal-inf.ru');
};

main();