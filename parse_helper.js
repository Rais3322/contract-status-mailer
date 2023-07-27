const moment = require('moment');

const parseContracts = async (rawValue) => {
	let stringDate = '';
	if (rawValue[11]) {
		try {
			const contractDate = moment(rawValue[11], 'DD.MM.YYYY').toDate();
			stringDate = contractDate.toISOString();
		} catch (error) {
			stringDate = '';
		};
	};
	parsedValue = {
		uniqueField: rawValue[0] + " " + rawValue[1] +  " " + rawValue[3] + " " + rawValue[10],
		system: rawValue[0],
		project: rawValue[1],
		orgName: rawValue[3],
		ITN: rawValue[4],
		contractNumber: rawValue[10],
		contractDate: stringDate
	};

	return parsedValue;
};

const parseCustomers = async (rawValue) => {
	parsedValue = {
		orgName: rawValue[3],
		ITN: rawValue[0].slice(0, 10),
		email: rawValue[2],
		district: rawValue[1]
	};

	return parsedValue
};

module.exports = { parseContracts, parseCustomers }