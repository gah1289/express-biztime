const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');
const slugify = require('slugify');

// GET /invoices
// Return info on invoices: like {invoices: [{id, comp_code}, ...]}

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query('SELECT * FROM invoices');
		return res.json({ invoices: results.rows });
	} catch (e) {
		return next(e);
	}
});

// GET /invoices/[id]
// Returns obj on given invoice.

// If invoice cannot be found, returns 404.

// Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}}

router.get('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query('SELECT * FROM invoices WHERE id = $1', [
			id
		]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
		}
		return res.json({ invoices: results.rows });
	} catch (e) {
		return next(e);
	}
});

// POST /invoices
// Adds an invoice.

// Needs to be passed in JSON body of: {comp_code, amt}

// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.post('/', async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const paid = false;
		let paid_date = null;
		const results = await db.query(
			'INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ($1, $2, $3, $4) RETURNING comp_code, amt, paid, paid_date',
			[
				comp_code,
				amt,
				paid,
				paid_date
			]
		);
		return res.status(201).json({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// PUT /invoices/[id]
// Updates an invoice.

// If invoice cannot be found, returns a 404.

// Needs to be passed in a JSON body of {amt}

// Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}

router.put('/:id', async (req, res, next) => {
	try {
		let id = req.params.id;
		let { amt, paid } = req.body;
		let paid_date = null;
		let result = await db.query('SELECT * FROM invoices WHERE id=$1', [
			id
		]);
		if (result.rows.length == 0) {
			throw new ExpressError(`Cannot update invoice with id of ${id}`, 404);
		}
		currentPaidDate = result.rows[0].paid_date;

		if (paid && !currentPaidDate) {
			paid_date = new Date();
		}
		else if (!paid) {
			paid_date == null;
		}
		else {
			paid_date = currentPaidDate;
		}

		const results = await db.query(
			'UPDATE invoices SET amt=$2, paid=$3, paid_date=$4 WHERE id=$1 RETURNING id, comp_code, amt, paid, paid_date',
			[
				id,
				amt,
				paid,
				paid_date
			]
		);

		return res.send({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

// DELETE /invoices/[id]
// Deletes an invoice.

// If invoice cannot be found, returns a 404.

// Returns: {status: "deleted"}

router.delete('/:id', async (req, res, next) => {
	try {
		const id = req.params.id;
		const results = await db.query('DELETE FROM invoices WHERE id = $1', [
			id
		]);
		if (results.rowCount.length == 0) {
			throw new ExpressError(`Cannot delete invoice with id of ${id}`);
		}
		return res.send({ status: 'deleted' });
	} catch (e) {
		return next(e);
	}
});

// Also, one route from the previous part should be updated:

// GET /companies/[code]
// Return obj of company: {company: {code, name, description, invoices: [id, ...]}}

// If the company given cannot be found, this should return a 404 status response.

module.exports = router;
