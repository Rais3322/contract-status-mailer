const mongoose = require('mongoose');

const connectDB = async (db_path) => {
	try {
		mongoose.connect(db_path, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('DB connected');
	} catch (error) {
		console.error('Error connecting DB:', error);
	};
};

const disconnectDB = async () => {
	try {
		mongoose.disconnect();
		console.log('DB disconnected');
	} catch (error) {
		console.error('Error disconnecting DB:', error);
	};
};

const addRecord = async (model, record, key, callback) => {
	if (key !== undefined) {
		const existingRecord = await model.findOne({ [key]: record[key] });
		if (!existingRecord) {
			if (typeof callback === 'function') {
				callback();
			};
			await model.create(record);
		};
	} else {
		const existingRecord = await model.findOne(record);
		if (!existingRecord) {
			if (typeof callback === 'function') {
				callback();
			};
			await model.create(record);
		};
	};
};

const updateRecord = async (model, record, key) => {
	await model.updateOne({ [key]: record[key] }, { $set: record });
};

const retrieveRecord = async (model, key, criteria) => {
	let result;
	if ((key !== undefined) && (criteria !== undefined)) {
		result = await model.find({ [key]: [criteria] })
	} else {
		result = await model.find();
	};
	return result;
};

module.exports = { connectDB, disconnectDB, addRecord, updateRecord, retrieveRecord };