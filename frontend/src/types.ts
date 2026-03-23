// USER
// TODO: The backend should be modified to accept UserForm and intuit the other fields
export interface UserFormBackend {
    user_id: number;
    username: string;
    email: string;
    acct_type: 'Admin' | 'Researcher' | 'Subscriber' | 'Guest';
    pw_hash: string;
    creation_date: string;
}

// The expected structure of a user when requested from the db
export interface UserGet {
    username: string;
    email: string;
    acct_type: 'Admin' | 'Researcher' | 'Subscriber' | 'Guest';
    user_id: number;
    creation_date: string;
    last_login: string;
}

// TODO: Match db expected response
export interface UserResponse {
    id: string;
    username: string;
    email: string;
}

// REGION
/* 
 * Represents a region in the db
 * This form is followed for both
 * creating a new region and requesting
 * an old one.
 */
export interface Region {
    region_id: number;
    region_name: string;
    region_type: string;
    geo_boundary: string;
    parent_region_id: number;
}

// TODO: Match db expected response
export interface RegionResponse {
    id: string;
    region_name: string;
}

// METRIC
/* 
 * Represents a metric in the db
 * NOTE: Only acceptable value_type appears
 * to be Total according to db docs, so that
 * is reflected here.
 */
export interface Metric {
    metric_name: string;
    unit: string;
    value_type: 'Total';
    metric_id: number;
    description: string;
}

// TIME PERIOD
export interface TimePeriod {
    period_name: string;
    start_year: number;
    end_year: number;
    period_id: number;
}

// FOREST OBSERVATION
export interface ForestObservationFormBackend {
    value: number;
    source_date: string;
    period_id: number;
    metric_id: number;
    region_id: number;
}

// TODO: Match db expected response
export interface ForestObservationResponse {
    id: number;
    value: number;
}

// GENERIC
export interface ServerErrorResponse {
    reason: string;
    message: string;
    fieldName: string;
    error: boolean;
}
