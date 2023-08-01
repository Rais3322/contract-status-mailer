const moment = require('moment');

const TASK_NUMBER = 'Номер задачи'

const parseContracts = async (rawValue) => {
	let parsedDate = '';
	if (rawValue[8]) {
		parsedDate = await parseDate(rawValue[8]);
	};
	const parsedValue = {
		uniqueField: rawValue[3],
		orgName: rawValue[0],
		ITN: rawValue[1],
		contractNumber: rawValue[7],
		contractDate: parsedDate,
		email: rawValue[4],
		taskLink: rawValue[28],
	};

	return parsedValue;
};

const parseCustomers = async (rawValue) => {
	const parsedValue = {
		orgName: rawValue[3],
		ITN: rawValue[0].slice(0, 10),
		email: rawValue[2],
		district: rawValue[1]
	};

	return parsedValue
};

const parseDate = async (rawDate) => {
	try {
		const contractDate = moment(rawDate, 'DD.MM.YYYY').toDate();
		const strDate = contractDate.toISOString();

		return strDate;
	} catch (error) {
		const strDate = '';

		return strDate;
	}
}

const parseNotionLink = async (rawLink) => {
	const regex = /([0-9a-f]{32})/i;
	const match = rawLink.match(regex);

	return match ? match[0] : null;
}

const parseNotionTaskNumber = async (rawResponse) => {
	const taskNumber = rawResponse.properties[TASK_NUMBER].number;

	return taskNumber
}

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


module.exports = { parseContracts, parseCustomers, parseNotionLink, parseNotionTaskNumber, mergeCustomers }