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

// TODO: Match db expected response
export interface UserResponse {
    id: string;
    username: string;
    email: string;
}

// REGION
export interface RegionFormBackend {
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
