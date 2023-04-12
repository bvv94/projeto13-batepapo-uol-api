import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";


//---Criação do Servidor---//
const app = express();
const PORT = 5000;

//---App escutando à espera de requisições---//
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))

//--Configurações--//
app.use(express.json());
app.use(cors());
dotenv.config();

//---Configurações Banco de Dados---//
let db;
let MongoClient = new MongoClient(process.env.DATABASE_URL)
MongoClient.connect()
    .then(() => db = MongoClient.db())
    .catch((err) => console.log(err.message))