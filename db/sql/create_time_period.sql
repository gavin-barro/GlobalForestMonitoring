-- time_period table
CREATE TABLE time_periods (
    period_id        SERIAL          PRIMARY KEY,
    period_name      VARCHAR(100)    NOT NULL,                -- ex. '2000-2020 Gain Baseline', 'Annual 2023'
    start_year       INTEGER         NOT NULL,
    end_year         INTEGER,                                 -- NULL if single year
    CONSTRAINT chk_period_years CHECK (end_year IS NULL OR end_year >= start_year)
);