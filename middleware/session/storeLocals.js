import { validStatuses } from '../../models/Job.js';

export default (req, res, next) => {
	res.locals.user = req.user ? { name: req.user.name } : null;
	res.locals.info = req.flash('info');
	res.locals.errors = req.flash('error');
	res.locals.validStatuses = validStatuses;
	next();
};