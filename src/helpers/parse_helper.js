const moment = require('moment');

const parseContracts = async (rawValue) => {
	let parsedDate = '';
	if (rawValue[11]) {
		parsedDate = await parseDate(rawValue[11]);
	};
	const parsedValue = {
		uniqueField: rawValue[0] + " " + rawValue[1] +  " " + rawValue[3] + " " + rawValue[10],
		system: rawValue[0],
		project: rawValue[1],
		orgName: rawValue[3],
		ITN: rawValue[4],
		contractNumber: rawValue[10],
		contractDate: parsedDate
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


module.exports = { parseContracts, parseCustomers, mergeCustomers }