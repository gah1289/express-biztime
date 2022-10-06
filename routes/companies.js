const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');

// GET /companies
// Returns list of companies, like {companies: [{code, name}, ...]}

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query('SELECT * FROM companies');
		return res.json({ companies: results.rows });
	} catch (e) {
		return next(e);
	}
});

// GET /companies/[code]
// Return obj of company: {company: {code, name, description}}
// If the company given cannot be found, this should return a 404 status response.

router.get('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const results = await db.query('SELECT * FROM companies WHERE code = $1', [
			code
		]);
		let invoices_obj = await db.query('SELECT * FROM invoices WHERE comp_code=$1', [
			code
		]);
		let invoices = [];

		if (invoices_obj.rows.length == 0) {
			invoices = null;
		}
		else {
			for (let invoice of invoices_obj.rows) {
				invoices.push(invoice);
			}
		}

		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find company with code of ${code}`, 404);
		}
		return res.json({ company: results.rows, invoices });
	} catch (e) {
		return next(e);
	}
});

// POST /companies
// Adds a company.

// Needs to be given JSON like: {code, name, description}

// Returns obj of new company: {company: {code, name, description}}

router.post('/', async (req, res, next) => {
	try {
		const { code, name, description } = req.body;
		const results = await db.query(
			'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
			[
				code,
				name,
				description
			]
		);
		return res.status(201).json({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// PUT /companies/[code]
// Edit existing company.

// Should return 404 if company cannot be found.

// Needs to be given JSON like: {name, description}

// Returns update company object: {company: {code, name, description}}

router.put('/:code', async (req, res, next) => {
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const results = await db.query(
			'UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description',
			[
				code,
				name,
				description
			]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't update company with code of ${code}`, 404);
		}
		return res.send({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// DELETE /companies/[code]
// Deletes company.

// Should return 404 if company cannot be found.

// Returns {status: "deleted"}

router.delete('/:code', async (req, res, next) => {
	try {
		const results = db.query('DELETE FROM companies WHERE code = $1', [
			code
		]);
		return res.send({ status: 'deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
