const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const contractSchema = new Schema({
	id: ObjectId,
	orgName: String,
	ITN: Number,
	contractNumber: String,
	contractDate: Date,
});

const customerSchema = new Schema({
	id: ObjectId,
	orgName: String,
	ITN: Number,
	email: String,
	district: String,
});

const Contract = mongoose.model("Contract", contractSchema);

const Customer = mongoose.model("Customer", customerSchema);

const connectDB = async (db_path) => {
	mongoose.connect(db_path, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
}

const addRecord = async (model, data) => {
	try {
		const newRecord = new model(data);
		await newRecord.save();
		return newRecord;
	} catch (error) {
		throw error;
	};
};

module.exports = { connectDB, addRecord };