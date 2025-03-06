import express from 'express';
import 'express-async-errors';
import rateLimiter from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from './middleware/security/xss.js';
import mongoSanitize from './middleware/security/mongoSanitize.js';
import session from 'express-session';
import connectMongoSession from 'connect-mongodb-session';
import passportSetup from './security/passportSetup.js';
import passport from 'passport';
import flash from 'connect-flash';
import storeLocals from './middleware/session/storeLocals.js';
import cookieParser from 'cookie-parser';
import csrf from 'host-csrf';
import authMiddleware from './middleware/security/auth.js';
import wordRouter from './routes/secretWord.js';
import sessionsRouter from './routes/sessions.js';
import secretWordRouter from './routes/secretWord.js';
import jobsRouter from './routes/jobs.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import mongoSanitize from './middleware/security/mongoSanitize.js';
import session from 'express-session';
import connectMongoSession from 'connect-mongodb-session';
import passportSetup from './utils/security/passportInit.js';
import connectDatabase from './db/connect.js';

const app = express();

app.set('view engine', 'ejs');
app.use(
	rateLimiter({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100 // max requests, per IP, per amount of time above
	}),
	express.urlencoded({ extended: true }),
	helmet(),
	hpp(),
	xss(),
	mongoSanitize()
);

if (app.get('env') === 'development') {
	process.loadEnvFile('./.env');
}

const MongoDBStore = connectMongoSession(session);
const store = new MongoDBStore({
	uri: process.env.MONGO_URI,
	collection: 'mySessions'
});
store.on('error', console.error);
const sessionParams = {
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
	store,
	cookie: {
		sameSite: true
	}
};
const csrfOptions = {
	protected_operations: ['POST'],
	protected_content_types: [
		'application/json',
		'application/x-www-form-urlencoded'
	],
	development_mode: true
};

if (app.get('env') === 'production') {
	sessionParams.cookie.secure = true;
	csrfOptions.development_mode = false;
}

app.use(session(sessionParams));
passportSetup();
app.use(passport.initialize(), passport.session());
app.use(flash(), storeLocals);

app.use(cookieParser(process.env.SESSION_SECRET));
const csrfMiddleware = csrf(csrfOptions);
app.use(csrfMiddleware);

app.get('/', (req, res) => {
	// initial CSRF token depends on user going to home page first
	csrf.token(req, res);
	res.render('index');
});
app.use('/sessions', sessionsRouter);
app.use('/secretWord', csrfMiddleware, authMiddleware, wordRouter);
app.use('/jobs', csrfMiddleware, authMiddleware, jobsRouter);
app.use(notFound, errorHandler);

const port = process.env.PORT || 5000;
const start = async () => {
	try {
		await connectDatabase(process.env.MONGO_URI);
		app.listen(port, err => {
			if (err) {
				console.error(`Could not start server on port ${port}.`);
				throw err;
			}
			console.log(`Server listening on port ${port}.`);
			console.log(`Access at: http://localhost:${port}`);
		});
	} catch (error) {
		console.log(error);
	}
};
start();