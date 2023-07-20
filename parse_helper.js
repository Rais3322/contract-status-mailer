const parseContracts = async (rawValue) => {
	parsedValue = {
		orgName: rawValue[0],
		ITN: rawValue[1],
		contractNumber: rawValue[7],
		contractDate: rawValue[8]
	};

	return parsedValue;
};

const parseCustomers = async (rawValue) => {
	parsedValue = {
		orgName: rawValue[3],
		ITN: rawValue[0],
		email: rawValue[2],
		district: rawValue[1]
	};

	return parsedValue
};

module.exports = { parseContracts, parseCustomers }