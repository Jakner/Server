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

{/*Verificação de login*/}
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query("SELECT * FROM usuarios WHERE email = $1", [email], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.rows.length > 0) {
      bcrypt.compare(password, result.rows[0].password, (error, response) => {
        if (error) {
          res.send(error);
        }
        if (response === true) {
          res.send(response);
        } else {
          res.send({ msg: "Email ou senha incorreta" });
        }
      });
    } else {
      res.send({ msg: "Usuário não registrado!" });
    }
  });
});

// Inserir item
app.post("/insert", async (req, res) => {
  const {
    nome,
    dataNascimento,
    email,
    telefone,
    endereco,
    rg,
    cpf,
    matricula,
    valorMensalidade
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO items (nome, data_nascimento, email, telefone, endereco, rg, cpf, matricula, valor_mensalidade)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [nome, dataNascimento, email, telefone, endereco, rg, cpf, matricula, valorMensalidade]
    );
    console.log("Insert result:", result);
    res.send({ msg: "Item inserido com sucesso" });
  } catch (err) {
    console.error("Erro ao inserir item:", err);
    res.status(500).send({ msg: "Erro ao inserir item", error: err.message });
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
  const {
    id,
    nome,
    dataNascimento,
    email,
    telefone,
    endereco,
    rg,
    cpf,
    matricula,
    valorMensalidade
  } = req.body;

  try {
    await db.query(
      `UPDATE items
       SET nome = $1,
           data_nascimento = $2,
           email = $3,
           telefone = $4,
           endereco = $5,
           rg = $6,
           cpf = $7,
           matricula = $8,
           valor_mensalidade = $9
       WHERE id = $10`,
      [nome, dataNascimento, email, telefone, endereco, rg, cpf, matricula, valorMensalidade, id]
    );
    res.send({ msg: "Item atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar item:", err);
    res.status(500).send({ msg: "Erro ao atualizar item", error: err.message });
  }
});


// Deletar item
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.send({ msg: "Item deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar item:", err);
    res.status(500).send({ msg: "Erro ao deletar item", error: err.message });
  }
});

app.listen(3003, () => {
  console.log("Rodando na porta 3003");
});
