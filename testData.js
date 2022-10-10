const db = require('./db');

async function createData() {
	await db.query('DELETE FROM invoices');
	await db.query('DELETE FROM companies');
	await db.query("SELECT setval('invoices_id_seq', 1, false)");
	testCompanyResults = await db.query(
		`INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.') RETURNING  code, name, description`
	);

	testCompany = testCompanyResults.rows[0];

	testInvoiceResults = await db.query(
		`INSERT INTO invoices (comp_code, amt, paid,  paid_date)
        VALUES ('apple', 100, false, null) RETURNING *`
	);
	testInvoice = testInvoiceResults.rows[0];
}

module.exports = { createData };
