-- land_cover_type table
CREATE TABLE land_cover_types (
    lct_id           SERIAL          PRIMARY KEY,
    type_name        VARCHAR(100)    NOT NULL UNIQUE,
    description      TEXT,
    category         VARCHAR(50)     NOT NULL                 -- 'Natural', 'Managed', 'Disturbed', etc.
);