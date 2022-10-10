process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const { createData } = require('../testData');

beforeEach(createData);

afterEach(async () => {
	await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
	await db.end();
});

describe('GET /companies', () => {
	test('Get a list with one company', async () => {
		const res = await request(app).get('/companies');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			companies : [
				testCompany
			]
		});
	});
});

describe('GET /companies/:code', () => {
	test('Gets a single company', async () => {
		const res = await request(app).get(`/companies/${testCompany.code}`);
		const invoiceData = await db.query('SELECT * FROM invoices WHERE id=1');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			company  : [
				testCompany
			],
			invoices : [
				{
					id        : 1,
					comp_code : 'apple',
					amt       : 100,
					paid      : false,
					paid_date : null,
					add_date  : expect.any(String)
				}
			]
		});
	});
	test('Responds with 404 for invalid id', async () => {
		const res = await request(app).get(`/companies/0`);
		expect(res.statusCode).toBe(404);
	});
});

describe('POST /companies', () => {
	test('Creates a single company', async () => {
		const res = await request(app).post('/companies').send({ name: 'IBM', description: 'Big Blue' });
		expect(res.statusCode).toBe(201);
		expect(res.body).toEqual({
			company : { code: 'IBM', name: 'IBM', description: 'Big Blue' }
		});
	});
});

describe('PUT /companies/:code', () => {
	test('Updates a single company', async () => {
		const res = await request(app)
			.put(`/companies/${testCompany.code}`)
			.send({ name: 'Apple', description: 'Maker of iPhones' });
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			company : { code: 'apple', name: 'Apple', description: 'Maker of iPhones' }
		});
	});
	test('Responds with 404 for invalid id', async () => {
		const res = await request(app)
			.patch(`/companies/0`)
			.send({ code: 'ibm', name: 'IBM', description: 'Big Blue' });
		expect(res.statusCode).toBe(404);
	});
});

describe('DELETE /companies/:code', () => {
	test('Deletes a single company', async () => {
		const res = await request(app).delete(`/companies/${testCompany.code}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: 'deleted' });
	});
});
