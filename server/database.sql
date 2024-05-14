CREATE DATABASE snowballdb;
\c snowballdb

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    type VARCHAR(8) NOT NULL,
    name VARCHAR(50) NOT NULL,
    amount NUMERIC(16,2) NOT NULL,
    date DATE NOT NULL,
    frequency VARCHAR(15) NOT NULL
);

CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    date DATE NOT NULL
);