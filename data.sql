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