import express from 'express';
const router = express.Router();

import { getWord, postWord } from '../controllers/secretWord.js';

router.route('/').get(getWord).post(postWord);

export default router;
