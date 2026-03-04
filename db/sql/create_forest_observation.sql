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