-- region table (with self-referencing hierarchy)
CREATE TABLE regions (
    region_id        SERIAL          PRIMARY KEY,
    region_name      VARCHAR(150)    NOT NULL,
    region_type      VARCHAR(50)     NOT NULL,                -- 'Country', 'Province', 'Protected Area', etc.
    geo_boundary     TEXT,                                    -- WKT or GeoJSON string 
    parent_region    INTEGER         REFERENCES regions(region_id) ON DELETE RESTRICT ON UPDATE CASCADE
);