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

const formMessage = async (contract) => {
	const orgName = contract.orgName;
	const contractNumber = contract.contractNumber;
	const contractDate = contract.contractDate;
	const msgText = `
		<p>
			Здравствуйте, уважаемый Заказчик ${orgName}.
		</p>
		<strong>
			Вы получили это письмо в результате подписания Контракта № ${contractNumber} от ${contractDate}.
		</strong>
		<p>
			Коллектив ООО “Технический центр Баланс-Информ” благодарит Вас за доверие в выполнении поставленной задачи. Мы уже начали подготовку к исполнению своих обязательств по Контракту и приложим все усилия, чтобы у Вас остались только позитивные эмоции от нашего взаимодействия.
		</p>
		<p>Для возможности максимально оперативного исполнения Контракта просим Вас в ответ на данное письмо сообщить <strong>контактные данные ответственного лица</strong> с Вашей стороны:<br>
			&nbsp;&nbsp;&nbsp;&nbsp;– ФИО;<br>
			&nbsp;&nbsp;&nbsp;&nbsp;– должность;<br>
			&nbsp;&nbsp;&nbsp;&nbsp;– номер телефона (предпочтительнее мобильного).
		</p>
		<p>
			С Уважением к Вам,<br>
			Коллектив ООО “Технический центр Баланс-Информ”
		</p>
		<p>
			+7(495)212-16-72 | help@bal-inf.ru – Технический отдел<br>
			+7(499)653-87-07 | b2g@bal-inf.ru – Департамент по работе с заказчиками
		</p>
	`;

	return msgText;
};

const sendContractInfo = async (dst, contract) => {
	contract = {
		orgName: 'МБОУ «Школа № 18» (МБДОУ д/с № 19 "Лесная сказка" ИНН 5001041601)',
		contractNumber: '1',
		contractDate: '27.07.2023'
	};
	const sourceEmail = process.env.GMAIL_USER;
	const desinationEmail = dst;
	const subject = 'Информирование по заключенному договору на оказание услуг';
	const message = await formMessage(contract);

	sendGmailMessage(sourceEmail, desinationEmail, subject, message);
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

	// sendContractInfo('ndi@bal-inf.ru');
};

main();