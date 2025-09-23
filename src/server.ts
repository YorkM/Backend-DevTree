import express from 'express';
import 'dotenv/config';
import router from './router';
import { conectarDB } from './config/db';

const app = express();

conectarDB();

app.use(express.json());

app.use('/', router);


export default app;