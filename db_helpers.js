const fs = require('fs')
const MissingPropertyError = require('./db_errors.js')

const insertNewRecords = async (db, table, data, key, additKey) => {
	const existingRecords = db[table];
	const newRecords = data.filter((newRecord) => {
		return !existingRecords.some((existingRecord) => {
			return (
				(existingRecord[key] === newRecord[key])
				&&
				(existingRecord[additKey] === newRecord[additKey])
			);
		});
	});

	newRecords.forEach(newRecord => {
		db[table].push(newRecord);
	});
};

const updateRecords = async (db, table, data, key, additKey) => {
	const existingRecords = db[table];

	data.forEach(upToDateRecord => {
		const recordToUpdate = existingRecords.find((existingRecord) => {
			return (
				(existingRecord[key] === upToDateRecord[key])
				&
				(existingRecord[additKey] === upToDateRecord[additKey])
			);
		});

		if (recordToUpdate) {
			Object.assign(recordToUpdate, upToDateRecord);
		}
	});
};

const writeDBData = async (db, filePath) => {
	fs.writeFileSync(filePath, JSON.stringify(db, null, 4));
};

const readTable = async (db, table) => {
	if (!(table in db)) {
		throw new MissingPropertyError;
	}

	return db[table];
};

module.exports = { insertNewRecords, updateRecords, writeDBData, readTable };