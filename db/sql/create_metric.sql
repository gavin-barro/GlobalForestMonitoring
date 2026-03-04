-- metric table (lookup for observation types)
CREATE TABLE metrics (
    metric_id        SERIAL          PRIMARY KEY,
    metric_name      VARCHAR(100)    NOT NULL UNIQUE,         -- ex. 'Tree Cover Gain', 'Gross Carbon Removal'
    description      TEXT,
    unit             VARCHAR(30)     NOT NULL,                -- 'hectares', 'Mg CO2e'
    value_type       VARCHAR(20)     NOT NULL 
        CHECK (value_type IN ('Total', 'PerHectare', 'Percentage', 'Rate'))
);