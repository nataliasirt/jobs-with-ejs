import CustomAPIError from './custom-api.js';

export default class UnauthenticatedError extends CustomAPIError {
	constructor(message) {
		super(message);
		this.statusCode = 401;
	}
}