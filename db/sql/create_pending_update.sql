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