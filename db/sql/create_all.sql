-- Global Forest Watch Database System - PostgreSQL Schema
-- CS 5614 Final Project
-- Team: James Agresto, Gavin Barro, Peter Gillen

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


-- metric table (lookup for observation types)
CREATE TABLE metrics (
    metric_id        SERIAL          PRIMARY KEY,
    metric_name      VARCHAR(100)    NOT NULL UNIQUE,         -- ex. 'Tree Cover Gain', 'Gross Carbon Removal'
    description      TEXT,
    unit             VARCHAR(30)     NOT NULL,                -- 'hectares', 'Mg CO2e'
    value_type       VARCHAR(20)     NOT NULL 
        CHECK (value_type IN ('Total', 'PerHectare', 'Percentage', 'Rate'))
);

-- time_period table
CREATE TABLE time_periods (
    period_id        SERIAL          PRIMARY KEY,
    period_name      VARCHAR(100)    NOT NULL,                -- ex. '2000-2020 Gain Baseline', 'Annual 2023'
    start_year       INTEGER         NOT NULL,
    end_year         INTEGER,                                 -- NULL if single year
    CONSTRAINT chk_period_years CHECK (end_year IS NULL OR end_year >= start_year)
);

-- region table (with self-referencing hierarchy)
CREATE TABLE regions (
    region_id        SERIAL          PRIMARY KEY,
    region_name      VARCHAR(150)    NOT NULL,
    region_type      VARCHAR(50)     NOT NULL,                -- 'Country', 'Province', 'Protected Area', etc.
    geo_boundary     TEXT,                                    -- WKT or GeoJSON string 
    parent_region    INTEGER         REFERENCES regions(region_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- land_cover_type table
CREATE TABLE land_cover_types (
    lct_id           SERIAL          PRIMARY KEY,
    type_name        VARCHAR(100)    NOT NULL UNIQUE,
    description      TEXT,
    category         VARCHAR(50)     NOT NULL                 -- 'Natural', 'Managed', 'Disturbed', etc.
);

-- region_classification (junction table - N:M between region and land_cover_type)
CREATE TABLE region_classifications (
    lct_id           INTEGER         NOT NULL 
        REFERENCES land_cover_types(lct_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    rc_region_id     INTEGER         NOT NULL 
        REFERENCES regions(region_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (lct_id, rc_region_id)
);

-- forest_observation (core fact table)
CREATE TABLE forest_observations (
    observation_id       SERIAL          PRIMARY KEY,
    value                NUMERIC(18,4)   NOT NULL,            -- main measurement value
    source_date          DATE            NOT NULL,
    observation_period_id INTEGER         NOT NULL 
        REFERENCES time_periods(period_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    observation_metric   INTEGER         NOT NULL 
        REFERENCES metrics(metric_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    describing_region_id INTEGER         NOT NULL 
        REFERENCES regions(region_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE (describing_region_id, observation_period_id, observation_metric)
);

-- pending_update
CREATE TABLE pending_updates (
    update_id            SERIAL          PRIMARY KEY,
    submit_date          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    proposed_value       NUMERIC(18,4)   NOT NULL,
    reason               TEXT            NOT NULL,
    status               VARCHAR(20)     NOT NULL 
        CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Withdrawn')),
    approving_admin_id   INTEGER                  -- NULL until approved/rejected
        REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    submitting_user_id   INTEGER         NOT NULL 
        REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    forest_observation_id INTEGER                  -- NULL if new observation, not update
        REFERENCES forest_observations(observation_id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- subscription (composite key)
CREATE TABLE subscriptions (
    user_id              INTEGER         NOT NULL 
        REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    metric_id            INTEGER                  -- NULL = any/all metrics
        REFERENCES metrics(metric_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    region_id            INTEGER                  -- NULL = global/all regions
        REFERENCES regions(region_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    active               BOOLEAN         NOT NULL DEFAULT TRUE,
    threshold_value      NUMERIC(10,4),                           -- ex. 5.0 for 5% change
    PRIMARY KEY (user_id, metric_id, region_id)                     -- unique per combo
);