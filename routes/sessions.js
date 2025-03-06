import express from 'express';
import csrf from 'host-csrf';
import passport from 'passport';
const router = express.Router();

import {
	logonShow,
	registerShow,
	registerDo,
	logoff
} from '../controllers/sessions.js';

router
	.route('/register')
	.get(registerShow)
	.post((req, res, next) => {
		res.locals.csrf = csrf.token(req, res);
		next();
	}, registerDo);

router
	.route('/logon')
	.get(logonShow)
	.post(
		(req, res, next) => {
			if (res.locals.csrf) res.locals.csrf = csrf.refresh(req, res);
			else res.locals.csrf = csrf.token(req, res);

			next();
		},
		passport.authenticate('local', {
			failureRedirect: '/sessions/logon',
			failureFlash: true
		}),
		(req, res) => {
			csrf.refresh(req, res);
			res.redirect('/');
		}
	);

router.route('/logoff').post(logoff);

export default router;