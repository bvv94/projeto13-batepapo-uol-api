import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dayjs from "dayjs";
import Joi from "joi";

//---Criação do Servidor---//
const app = express();
const PORT = 5000;

//--Configurações--//
app.use(express.json());
app.use(cors());
dotenv.config();

//---Configurações Banco de Dados---//
let db;
const mongoClient = new MongoClient(process.env.DATABASE_URL);

mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message))

//---Endpoints---//
app.post("/participants", async (req, res) => {
    const { name } = req.body;

    /// - Validação Joi  - //
    const schema = Joi.object({
        name: Joi.string().min(1).required(),
    });

    const { error } = schema.validate({ name });
    /// - FIM Joi - ///

    if (error) {
        return res.status(422).send("Todos os campos são obrigatórios!")
    }
    // Validações com a Joi
    // Impedir cadastro repetido

    const newName = { name, lastStatus: Date.now() };
    await db.collection("participants").insertOne(newName);

    const newMsg = { from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format ('HH:mm:ss') }
    await db.collection("messages").insertOne(newMsg);

    return res.sendStatus(201)
})

app.get("/participants", (req, res) => {
    db.collection("participants").find().toArray()
        .then((participants) => res.status(201).send(participants))
        .catch((err) => res.status(422).send(err.message)) //---mandar array vazio aqui?---//
})

app.post("/messages", (req, res) => {
    const { to, text, type } = req.body;
    const { User } = req.headers;

    const newMsg = {
        from: User,
        to,
        text,
        type,
        time: 'HH:mm:ss' // dayjs
    }
    if ((to || text !== '') || (type !== 'message') || (type !== 'private_message')) {
        //if () { Validação do from como participante existente
        db.collection("messages").insertOne(newMsg)
            .then(res.sendStatus(201)            )
            .catch(res.sendStatus(422))
        //}
    }
})

// voltar a codar daqui 
app.get("/messages", (req, res) => { })











//---App escutando à espera de requisições---//
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
