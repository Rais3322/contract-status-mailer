const path = require('path');
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const parse = require('./parse_helper');
const { Customer, Contract } = require('./db_models');
const { connectDB, addRecord, updateRecord, disconnectDB, retrieveRecord } = require('./db_helper');
const { authorize, fetchGoogleSheetsValue } = require('./google_helper');

const parseData = async (rawResponse, parseType) => {
	const rawValues = rawResponse.data.values;
	const parsedValues = [];
	for (const rawValue of rawValues) {
		const parsedValue = await parse[parseType](rawValue);
		parsedValues.push(parsedValue);
	};

	return parsedValues;
};

const mergeCustomers = async (customers) => {
	const result = customers.reduce((accumulator, customer) => {
		const existingItem = accumulator.find((item) => item.ITN === customer.ITN);
		if (existingItem) {
			if (!existingItem.orgName.includes(customer.orgName)) {
				existingItem.orgName.push(customer.orgName);
			}
			if (!existingItem.email.includes(customer.email)) {
				existingItem.email.push(customer.email);
			}
		} else {
			accumulator.push({
				orgName: [customer.orgName],
				ITN: customer.ITN,
				email: [customer.email],
				district: customer.district,
			});
		}

		return accumulator;
	}, []);

	return result;
};

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

	const mergedCustomers = await mergeCustomers(parsedCustomers);

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
};

main();