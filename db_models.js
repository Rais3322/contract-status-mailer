const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const contractSchema = new Schema({
	id: ObjectId,
	uniqueField: { type: String, unique: true },
	system: String,
	project: String,
	orgName: String,
	ITN: Number,
	contractNumber: String,
	contractDate: Date,
});

const customerSchema = new Schema({
	id: ObjectId,
	orgName: Array,
	ITN: { type: Number, unique: true },
	email: Array,
	district: String,
});

const Contract = mongoose.model("Contract", contractSchema);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = { Contract, Customer };