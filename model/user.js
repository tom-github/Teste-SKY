const mongoose = require('mongoose');

const uuid = require('uuid');

const { Schema } = mongoose;

const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  _id: {
    type: 'string',
    default: () => uuid.v4(),
    trim: true,
    lowercase: true,
  },
  nome: {
    type: String, require: true, lowercase: true,
  },
  email: {
    type: String, require: true, unique: true, lowercase: true,
  },
  senha: { type: String, require: true, select: false },
  telefones: [{
    _id: {
      type: 'string',
      default: () => uuid.v4(),
      trim: true,
      lowercase: true,
    },
    numero: { type: String, require: true },
    ddd: { type: String, require: true },
  }],
  token: { type: String, require: true },
  data_criacao: {
    type: Date,
    default() { return Date.now(); },
  },
  data_atualizacao: {
    type: Date,
    default() { return Date.now(); },
  },
  data_ultimo_login: { type: Date, default() { return Date.now(); } },
}, { id: false });

UserSchema.pre('save', async function save(next) {
  const user = this;
  if (!user.isDirectModified('senha')) return next();

  user.senha = await bcrypt.hash(user.senha, 10);
  return next();
});

UserSchema.set('toObject', { getters: true });
UserSchema.set('toJSON', { getters: true });

module.exports = mongoose.model('User', UserSchema);
