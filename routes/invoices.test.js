process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');
const { createData } = require('../testData');

beforeEach(createData);

afterEach(async () => {
	await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
	await db.end();
});

describe('GET /invoices', () => {
	test('Get a list with one invoice', async () => {
		const res = await request(app).get('/invoices');
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
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
});

describe('GET /invoices/:id', () => {
	test('Gets a single invoice', async () => {
		const res = await request(app).get(`/invoices/${testInvoice.id}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
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

describe('POST /invoices', () => {
	test('Creates a single invoice', async () => {
		const res = await request(app).post('/invoices').send({ comp_code: 'apple', amt: 150 });
		console.log(res.body);
		expect(res.statusCode).toBe(201);

		expect(res.body).toEqual({
			invoice : { comp_code: 'apple', amt: 150, paid: false, paid_date: null }
		});
	});
});

describe('PUT /invoices/:id', () => {
	test('Updates a single invoice', async () => {
		const res = await request(app)
			.put(`/invoices/${testInvoice.id}`)
			.send({ comp_code: 'apple', amt: 100, paid: true });
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({
			invoice : {
				id        : testInvoice.id,
				comp_code : 'apple',
				amt       : 100,
				paid      : true,
				paid_date : expect.any(String)
			}
		});
	});
	test('Responds with 404 for invalid id', async () => {
		const res = await request(app).patch(`/invoices/0`).send({ comp_code: 'apple', amt: 100, paid: true });
		expect(res.statusCode).toBe(404);
	});
});

describe('DELETE /invoices/:id', () => {
	test('Deletes a single company', async () => {
		const res = await request(app).delete(`/invoices/${testInvoice.id}`);
		// expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ status: 'deleted' });
	});
});
