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