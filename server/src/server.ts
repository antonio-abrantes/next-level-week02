// Configuração do dotenv
import { resolve } from "path";
import { config } from "dotenv";
config({ path: resolve(__dirname, "../.env") });

import express from 'express';
import routes from './routes';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(process.env.APP_PORT || 3333, ()=>{
  console.log("Server on http://localhost:3333");
});
