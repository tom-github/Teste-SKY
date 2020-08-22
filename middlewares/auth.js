const jwt = require('jsonwebtoken');

const bearer = (req, res, next) => {
  const authHeader = req.headers.authentication;

  if (!authHeader) return res.status(403).send({ mensagem: 'Não autorizado' });

  const parts = authHeader.split(' ');

  if (!parts.length === 2) return res.status(401).send({ mensagem: 'Token Inválido' });

  const [schema, token] = parts;

  if (!/^Bearer$/i.test(schema)) return res.status(401).send({ mensagem: 'Token mal formado' });

  jwt.verify(token, '6fe6e6d3-ab8f-4f71-998e-4a10f4a5b3f3', (err, decoded) => {
    if (err) return res.status(401).send({ mensagem: 'Token Inválido' });
    res.userId = decoded.id;
  });
  
  return next();
};

module.exports = bearer;