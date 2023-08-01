const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const contractSchema = new Schema({
	id: ObjectId,
	uniqueField: { type: String, unique: true },
	orgName: String,
	ITN: Number,
	contractNumber: String,
	contractDate: Date,
	email: String,
	taskLink: String,
	taskNumber: String
});

const customerSchema = new Schema({
	id: ObjectId,
	orgName: Array,
	ITN: { type: Number, unique: true },
	email: Array,
	district: String,
});

const Contract = mongoose.model("Contract", contractSchema);

module.exports = { Contract };