const express = require('express');
const ExpressError = require('../expressError');
const router = express.Router();
const db = require('../db');
const slugify = require('slugify');

router.get('/', async (req, res, next) => {
	try {
		const results = await db.query('SELECT * FROM industries');
		return res.json({ industries: results.rows });
	} catch (e) {
		return next(e);
	}
});

router.get('/:company', async (req, res, next) => {
	try {
		const { company } = req.params;
		const results = await db.query('SELECT * FROM industries WHERE company = $1', [
			company
		]);

		let industries = [];

		for (let co of results.rows) {
			industries.push(co);
		}

		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find industries with for company codeL ${company}`, 404);
		}
		return res.json({ company, industries });
	} catch (e) {
		return next(e);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { code, industry, company } = req.body;

		const results = await db.query(
			'INSERT INTO industries (code, industry, company) VALUES ($1, $2, $3) RETURNING code, industry, company',
			[
				code,
				industry,
				company
			]
		);
		return res.status(201).json({ company: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
