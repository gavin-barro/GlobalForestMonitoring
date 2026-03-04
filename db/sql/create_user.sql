-- user table
CREATE TABLE users (
    user_id          SERIAL          PRIMARY KEY,
    username         VARCHAR(50)     NOT NULL UNIQUE,
    pw_hash          VARCHAR(255)    NOT NULL,                -- bcrypt hash
    acct_type        VARCHAR(20)     NOT NULL 
        CHECK (acct_type IN ('Admin', 'Researcher', 'Subscriber', 'Guest')),
    email            VARCHAR(100)    NOT NULL UNIQUE,
    creation_date    DATE            NOT NULL DEFAULT CURRENT_DATE,
    last_login       TIMESTAMP       DEFAULT NULL
);
