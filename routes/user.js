const express = require('express');

const router = express.Router();

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const Users = require('../model/user');

const bearer = require('../middlewares/auth');

const createUserToken = (userId) => jwt.sign({ id: userId }, '6fe6e6d3-ab8f-4f71-998e-4a10f4a5b3f3');

router.post('/signup', async (req, res) => {
  const { email } = req.body;

  try {
    if (await Users.findOne({ email })) return res.send({ mensagem: 'E-mail já existente' });

    req.body.token = createUserToken(Users.id);
    const user = await Users.create(req.body);
    user.senha = undefined;

    return res.status(201).send({ user });
  } catch (err) {
    return res.status(500).send({ mensagem: `Erro cadastrar usuário: ${err}` });
  }
});

router.post('/signin', async (req, res) => {
  const { email, senha } = req.body;

  if (!email && !senha) return res.status(400).send({ error: 'Dados insuficientes!' });

  try {
    const user = await Users.findOne({ email }).select('+senha');

    if (!user) return res.status(401).send({ mensagem: 'Usuário e/ou senha inválidos' });

    const authorized = await bcrypt.compare(senha, user.senha);

    if (!authorized) return res.status(401).send({ mensagem: 'Usuário e/ou senha inválidos' });

    user.data_ultimo_login = Date.now();
    user.data_atualizacao = Date.now();
    await user.save();
    user.senha = undefined;
    return res.status(200).send({ user });
  } catch (err) {
    return res.status(500).send({ mensagem: `Erro ao buscar usuário ${err}` });
  }
});

router.get('/find', bearer, async (req, res) => {
  try {
    const tokeHeader = req.headers.authentication;
    const { userId } = req.query;
    const user = await Users.findOne({ _id: userId });
    
    if (user == null) return res.status(200).send({ mensagem: 'Usuário não cadastrado' });
    if (user.token !== tokeHeader.replace('Bearer ', '')) return res.status(403).send({ mensagem: 'Não autorizado' });

    const dateTimeNow = new Date();

    dateTimeNow.setMinutes(dateTimeNow.getMinutes() - 30);

    if (user.data_ultimo_login < dateTimeNow) return res.status(401).send({ mensagem: 'Sessão iválida' });

    return res.send(user);
  } catch (err) {
    return res.status(500).send({ mensagem: `Erro na consulta do usuário ${err}` });
  }
});

module.exports = router;
