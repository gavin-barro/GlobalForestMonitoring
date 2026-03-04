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