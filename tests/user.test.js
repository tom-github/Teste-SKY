const app = require('../app');

const request = require('supertest');

const mongoose = require("mongoose");

var userTest;
var collection;

beforeAll(async done => {
	const url = 'mongodb://admin:admin@clusterapi-shard-00-00.0aauy.mongodb.net:27017,clusterapi-shard-00-01.0aauy.mongodb.net:27017,clusterapi-shard-00-02.0aauy.mongodb.net:27017/API?ssl=true&replicaSet=atlas-fj9vig-shard-0&authSource=admin&retryWrites=true&w=majority';
	mongoose.connect(url, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
	collection = mongoose.connection.collections['users'];
	await collection.deleteOne({
		email: 'unittest@test.com.br'
	});
	done();
});

const userUnitTestDignUp = {
	nome: 'UnitTest',
	email: 'unittest@test.com.br',
	senha: '123teste',
	telefones: [{
			numero: '20896857',
			ddd: '11'
		},
		{
			numero: '987656789',
			ddd: '33'
		}
	]
};

const userUnitTestSignIn = {
	email: 'unittest@test.com.br',
	senha: '123teste'
};

const userUnitTestSignInUnauthorized = {
	email: 'unittestnot@test.com.br',
	senha: '123teste'
};

it('Deve retornar um json quando o endpoit não for encontrado', async done => {
    await request(app)
    .post('/user/signupnot')
    .send(userUnitTestDignUp)
    .expect(404)
    .expect('Content-Type', /json/)
    .expect({"mensagem":"Endpoint não encontrado"});
done();
});

it('Deve criar um novo usuário ao relaizar signup', async done => {
    await request(app)
    .post('/user/signup')
    .send(userUnitTestDignUp)
    .expect(201)
    .expect('Content-Type', /json/)
done();
});

it('Deve retornar o usuário se o e-mail já existir e a senha for a mesma ao realizar signin', async done => {
    await request(app)
    .post('/user/signin')
    .send(userUnitTestSignIn)
    .expect(200)
    .expect('Content-Type', /json/)
done();
});

it('Deve retornar não autorizado se o e-mail não estiver previamente cadastrado', async done => {
    await request(app)
    .post('/user/signin')
    .send(userUnitTestSignInUnauthorized)
    .expect(401)
    .expect('Content-Type', /json/)
    .expect({"mensagem":"Usuário e/ou senha inválidos"});
done();
});

it('não autorizar se a consulta nao possuir um header na requisição de Authentication com o valor "Bearer {token}"', async done => {
	await request(app)
		.get('/user/find?userId=bf36de25-e9cb-40dd-9998-526eaf1dfb3c')
		.expect('Content-Type', /json/)
        .expect(403)
        .expect({"mensagem":"Não autorizado"});
	done();
});


it('A consulta deve conter um header na requisição de Authentication com o valor "Bearer {token}"', async done => {
	userTest = await collection.findOne({
		email: 'unittest@test.com.br'
	});
    await request(app)
    .get('/user/find?userId=' + userTest.id)
    .set("Authentication", "Bearer " + userTest.token)
    .expect('Content-Type', /json/)
    .expect(200)
done();
});

it('A sessão é valida se o último login foi a menos que 30 minutos atrás para realizar a consulta', async done => {

	userTest = await collection.findOne({
		email: 'unittest@test.com.br'
	});
	await request(app)
		.get('/user/find?userId=' + userTest.id)
		.set("Authentication", `Bearer ${userTest.token}`)
		.expect('Content-Type', /json/)
		.expect(200);
	done();
});