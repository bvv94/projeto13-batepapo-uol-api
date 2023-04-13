import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import dayjs from "dayjs";

//---Criação do Servidor---//
const app = express();
const PORT = 5000;

//--Configurações--//
app.use(express.json());
app.use(cors());
dotenv.config();

//---Configurações Banco de Dados---//
let db;
let mongoClient = new MongoClient(process.env.DATABASE_URL)
MongoClient.connect()
    .then(() => db = MongoClient.db())
    .catch((err) => console.log(err.message))

//---Endpoints---//
app.post("/participants", (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(422).send("Todos os campos são obrigatórios!")
    }
    // Validações com a Joi
    // Impedir cadastro repetido

    const newName = { name, lastStatus: Date.now() };
    db.collection("participants").insertOne(newName);

    const newMsg = { from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: 'HH:mm:ss' }
    db.collection("messages").insertOne(newMsg);

})

app.get("/participants", (req, res) => {
    db.collection("participants").find().toArray()
        .then((participants) => res.status().send(participants))
        .catch((err) => res.status(500).send(err.message)) //---mandar array vazio aqui?---//
})

app.post("/messages", (req, res) => {
    const { to, text, type } = req.body
    //---pegar Header---//

    const newMsg = {
        // from: User, pegar do Header
        to,
        text,
        type,
        time: 'HH:mm:ss' // dayjs
    }
    if ((to || text !== '') || (type !== 'message') || (type !== 'private_message')) {
        //if () { Validação do from como participante existente
            db.collection("messages").insertOne(newMsg)
                .then(res.status(201)
                    )
                .catch(res.status(422))
      //}
    }
})

// voltar a codar daqui app.get("/messages", (req, res) => {})












//---App escutando à espera de requisições---//
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
