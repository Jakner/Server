const express = require("express");
const app = express();
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;

{/*Conexão com o banco de dados */}
const db = new Pool({
  user: "crud_etcq_user",
  host: "dpg-cqhtq8ogph6c73cagft0-a",
  database: "crud_etcq",
  password: "LK8AVmfAg7MiobSuoKrbNvzdXeWduo7y",
  port: 5432,
});

app.use(express.json());
app.use(cors());

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query("SELECT * FROM usuarios WHERE email = $1", [email], (err, result) => {
    if (err) {
      res.send(err);
    }
    if (result.rows.length === 0) {
      bcrypt.hash(password, saltRounds, (err, hash) => {
        db.query(
          "INSERT INTO usuarios (email, password) VALUES ($1, $2)",
          [email, hash],
          (error, response) => {
            if (error) {
              res.send(error);
            }
            res.send({ msg: "Usuário cadastrado com sucesso" });
          }
        );
      });
    } else {
      res.send({ msg: "Email já cadastrado" });
    }
  });
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

// Configs do CRUD
app.post("/insert", (req, res) => {
  const { name, cost } = req.body;
  let SQL = "INSERT INTO items (name, cost) VALUES ($1, $2)";

  db.query(SQL, [name, cost], (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.get("/get", (req, res) => {
  let SQL = "SELECT * FROM items";

  db.query(SQL, (err, result) => {
    if (err) console.log(err);
    else res.send(result.rows);
  });
});

app.get("/getCards/:nome", (req, res) => {
  const nome = req.params.nome;
  let sql = `SELECT * FROM items WHERE name LIKE $1`;
  db.query(sql, [`${nome}%`], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result.rows);
    }
  });
});

app.put("/edit", (req, res) => {
  const { id, name, cost } = req.body;

  let SQL = "UPDATE items SET name = $1, cost = $2 WHERE iditems = $3";

  db.query(SQL, [name, cost, id], (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  let SQL = "DELETE FROM items WHERE iditems = $1";

  db.query(SQL, [id], (err, result) => {
    if (err) console.log(err);
    else res.send(result);
  });
});

app.listen(3003, () => {
  console.log("Rodando na porta 3003");
});