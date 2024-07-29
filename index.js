const express = require("express");
const app = express();
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");

const saltRounds = 10;

// Conexão com o banco de dados
const db = new Pool({
  user: "crud_etcq_user",
  host: "dpg-cqhtq8ogph6c73cagft0-a",
  database: "crud_etcq",
  password: "LK8AVmfAg7MiobSuoKrbNvzdXeWduo7y",
  port: 5432,
});

app.use(express.json());
app.use(cors());

// Função para verificar se um email já está cadastrado
async function isEmailRegistered(email) {
  const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
  return result.rows.length > 0;
}

// Registro de usuário
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailExists = await isEmailRegistered(email);
    if (emailExists) {
      return res.send({ msg: "Email já cadastrado" });
    }

    const hash = await bcrypt.hash(password, saltRounds);
    await db.query("INSERT INTO usuarios (email, password) VALUES ($1, $2)", [email, hash]);
    res.send({ msg: "Usuário cadastrado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Verificação de login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.send({ msg: "Usuário não registrado!" });
    }

    const isMatch = await bcrypt.compare(password, result.rows[0].password);
    if (isMatch) {
      res.send({ msg: "Login bem-sucedido" });
    } else {
      res.send({ msg: "Email ou senha incorreta" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Inserir item
app.post("/insert", async (req, res) => {
  const { name, cost } = req.body;

  try {
    await db.query("INSERT INTO items (name, cost) VALUES ($1, $2)", [name, cost]);
    res.send({ msg: "Item inserido com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Obter todos os itens
app.get("/get", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items");
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Obter itens por nome
app.get("/getCards/:nome", async (req, res) => {
  const { nome } = req.params;

  try {
    const result = await db.query("SELECT * FROM items WHERE name LIKE $1", [`${nome}%`]);
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Editar item
app.put("/edit", async (req, res) => {
  const { id, name, cost } = req.body;

  try {
    await db.query("UPDATE items SET name = $1, cost = $2 WHERE iditems = $3", [name, cost, id]);
    res.send({ msg: "Item atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

// Deletar item
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM items WHERE iditems = $1", [id]);
    res.send({ msg: "Item deletado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.listen(3003, () => {
  console.log("Rodando na porta 3003");
});
