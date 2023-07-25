const path = require('path');
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const parse = require('./parse_helper');
const models = require('./models');
const { connectDB, addRecord } = require('./db_helper');
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

const main = async () => {
	const googleClient = await authorize().then(console.log('Authorized!'));
	const [fetchedContracts, fetchedCustomers] = await Promise.all([
		fetchGoogleSheetsValue(
			googleClient,
			process.env.CONTRACTS_SPREADSHEET,
			'Договора 2023!D5:L'
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
	connectDB(process.env.DB_PATH);
	const ContractData = {
		orgName: 'Муниципальное бюджетное общеобразовательное учреждение городского округа Балашиха «школа № 27»',
    ITN: '5001023271/500101001',
    email: 'school27bal@mail.ru',
    district: 'Балашиха'
	}
	addRecord(models.Customer, ContractData);
};

main();