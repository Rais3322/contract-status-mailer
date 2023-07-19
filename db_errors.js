class MissingProperyError extends Error {
	constructor(message) {
		super(message);
		this.name = "MissingProperyError";
		this.message = `You're trying to use property that doesn't exist.`;
	}
}

module.exports = MissingProperyError;