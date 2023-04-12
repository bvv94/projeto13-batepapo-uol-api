import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";


//---Criação do Servidor---//
const app = express();
const PORT = 5000;

//---App escutando à espera de requisições---//
app.listen (PORT, ()=>console.log(`Servidor rodando na porta ${PORT}`))

//--Configurações--//
app.use(express.json());
app.use (cors());

//---Configurações Banco de Dados---//
let db;
let MongoClient = new MongoClient("mongodb://localhost:27017/batepapouol")
MongoClient.connect()
    .then()
    .catch()