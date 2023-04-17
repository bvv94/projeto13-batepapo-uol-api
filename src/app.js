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
    try {
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
        // Validações com a Joi FIM //
        // Impedir cadastro repetido

        const exist = await db.collection('participants').findOne({ name })
        if (exist) {
            return res.status(409).send("Usuário já cadastrado")
        }

        const newName = { name, lastStatus: Date.now() };
        await db.collection("participants").insertOne(newName);

        const newMsg = { from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss') }
        await db.collection("messages").insertOne(newMsg);

        return res.sendStatus(201)
    }
    catch (error) {
        res.status(422)
    }
})

app.get("/participants", (req, res) => {
    db.collection("participants").find().toArray()
        .then((participants) => res.status(201).send(participants))
        .catch((err) => res.status(422).send(err.message)) //---mandar array vazio aqui?---//
})

app.post("/messages", async (req, res) => {
    const { to, text, type } = req.body;
    const { User } = req.headers;

    const schema = Joi.object({
        to: Joi.string().min(1).required(),
        text: Joi.string().min(1).required(),
        type: Joi.string().valid('message', 'private_message').required(),
    });

    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(422).send(error.details[0].message)
    }

    const participant = await db.collection('participants').findOne({ name: User })
    if (!participant) {
        return res.status(422)
    }

    const newMsg = {
        from: User,
        to,
        text,
        type,
        time: dayjs().format('HH:mm:ss') // dayjs
    }
    await db.collection("messages").insertOne(newMsg)
})

// voltar a codar daqui 
app.get("/messages", (req, res) => {
    const { User } = req.headers;
    const limit = parseInt(req.query.limit)

    if (isNaN(limit) || limit <= 0) {
        return res.status(422)
    }

    const query = {
        $or: [
            { to: User },
            { from: User },
            { to: 'Todos' },
            { to: { $exists: false } }
        ]
    }
    const options = { limit }
    
    db.collection('messages').find(query, options).toArray((err, result) =>{
        if (err) throw err;
        res.send(result);
    })
})

app.get("/status", async (req, res) => {
    const { User } = req.headers;

    if (!User) {
        return res.status(404)
    }

    const exist = await db.collection('participants').findOne({ name: User })
    if (!exist) {
        return res.status(404)
    }
    await db.collection("participants").updateOne({ name: User }, { $set: { lastStatus: Date.now() } })

    res.sendStatus(200)
})









//---App escutando à espera de requisições---//
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
