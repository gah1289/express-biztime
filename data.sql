DROP DATABASE IF EXISTS biztime;

CREATE DATABASE biztime;

\c biztime;

DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;



CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text   
);

CREATE TABLE industries (
    code text NOT NULL,
    industry text NOT NULL,
    company text NOT NULL REFERENCES companies ON DELETE CASCADE
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);


-- Add some sample data (by hand in psql is fine).

-- Change this route:

-- adding an industry
-- listing all industries, which should show the company code(s) for that industry
-- associating an industry to a company



INSERT INTO companies (code, name, description)
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('IBM', 'IBM', 'Big blue.');

INSERT INTO industries (code, industry, company) VALUES ('tech', 'Technology', 'apple'), ('ent', 'Entertainment', 'apple'), ('tech', 'Technology', 'IBM');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('IBM', 400, false, null);


  







-- psql -h localhost -p 5432 -U gah1289 -f data.sql

-- DROP DATABASE IF EXISTS biztime_test;

-- CREATE DATABASE biztime_test;

-- \c biztime_test;

-- DROP TABLE IF EXISTS invoices;
-- DROP TABLE IF EXISTS companies;

-- CREATE TABLE companies (
--     code text PRIMARY KEY,
--     name text NOT NULL UNIQUE,
--     description text
-- );

-- CREATE TABLE invoices (
--     id serial PRIMARY KEY,
--     comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
--     amt float NOT NULL,
--     paid boolean DEFAULT false NOT NULL,
--     add_date date DEFAULT CURRENT_DATE NOT NULL,
--     paid_date date,
--     CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
-- );