CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees integer,
    description text,
    logo_url text
);

INSERT INTO companies
VALUES (
    'FB',
    'Facebook',
    35000,
    'Social media giant',
    'https://image.flaticon.com/icons/png/512/124/124010.png'
);

INSERT INTO companies
VALUES (
    'G',
    'Google',
    72000,
    'Lord Google',
    'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png'
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL CHECK (equity <= 1),
    company_handle text NOT NULL REFERENCES companies(handle) ON DELETE CASCADE,
    date_posted DATE NOT NULL DEFAULT CURRENT_DATE
);

INSERT INTO jobs (title, salary, equity, company_handle)
VALUES (
    'Software Engineer',
    150000.00,
    .000001,
    'FB'
);

INSERT INTO jobs (title, salary, equity, company_handle)
VALUES (
    'CEO',
    15000000.00,
    .10,
    'G'
);

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text DEFAULT 'https://icon-library.net/images/default-user-icon/default-user-icon-4.jpg',
    is_admin boolean NOT NULL DEFAULT FALSE
);

INSERT INTO users
VALUES (
    'testuser',
    'password',
    'test',
    'user',
    'testuser@gmail.com',
    'testuser.jpg',
    'false'
);