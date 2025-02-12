import express from 'express';
import passport from 'passport';
const router = express.Router();
import csrf from 'host-csrf';

import {
	logonShow,
	registerShow,
	registerDo,
	logoff
} from '../controllers/sessions.js';

router.route('/register').get(registerShow).post(registerDo);

router
	.route('/logon')
	.get(logonShow)
	.post(
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