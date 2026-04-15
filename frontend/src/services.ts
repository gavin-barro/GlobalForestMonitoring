import axios, { type AxiosResponse } from 'axios';
import type { ForestObservationFormBackend, ForestObservationGet, Metric, Region, Subscription, TimePeriod, RegionClassification,
    UserFormBackend, UserGet, LandCoverType, LCTCreate, RegionClassificationCreate, } from './types';

// TODO: Ideally some structure like:
// const apiUrl =
//   `${location.protocol}//${location.hostname}:` +
//   `${location.port === '5173' ? '8080' : location.port}` +
//   `${import.meta.env.BASE_URL}/api`
// NOTE: This MUST be updated in future :^)
const apiUrl = "http://localhost:8000"

// TODO: Implement returning helpful error responses from requests

// GET
async function fetchAll<T>(endpoint: string): Promise<T[]> {
    try {
        const response: AxiosResponse<T[]> = await axios.get(`${apiUrl}/${endpoint}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${apiUrl}/${endpoint}:`, error);
        return [];
    }
}

export const getAllUsers = async(): Promise<UserGet[]> => fetchAll<UserGet>("users");
export const getAllRegions = async(): Promise<Region[]> => fetchAll<Region>("regions")
export const getAllMetrics = async(): Promise<Metric[]> => fetchAll<Metric>("metrics")
export const getAllTimePeriods = async(): Promise<TimePeriod[]> => fetchAll<TimePeriod>("time_periods")
export const getAllForestObservations = async(): Promise<ForestObservationGet[]> => fetchAll("forest_observations")

export const getSubscriptionByUser = async(user_id: number): Promise<Subscription[]> => fetchAll(`subscriptions/by-user/${user_id}`)

// CREATE
async function requestCreate<T>(endpoint: string, formData: T): Promise<Boolean> {
    try {
        await axios.post(
            `${apiUrl}/${endpoint}/`,
            formData
        );
        return true;
    } catch (error) {
        console.error(`Error creating element at url: ${apiUrl}/${endpoint}:`, error);
        return false;
    }
}

export const requestCreateUser = async(userForm: UserFormBackend): Promise<Boolean> => requestCreate<UserFormBackend>("users", userForm)
export const requestCreateRegion = async(regionForm: Region): Promise<Boolean> => requestCreate<Region>("regions", regionForm)
export const requestCreateForestObservation = async(forestObservationForm: ForestObservationFormBackend): Promise<Boolean> => requestCreate<ForestObservationFormBackend>("forest_observations", forestObservationForm)
export const requestCreateSubscription = async(subscription: Subscription): Promise<Boolean> => requestCreate<Subscription>("subscriptions", subscription);

// DELETE
/* Delete a user */
async function requestDelete(endpoint: string, id: number): Promise<Boolean> {
    try {
        await axios.delete(`${apiUrl}/${endpoint}/${id}`);
        return true;
    } catch (error) {
        return false;
    }
}

export const requestDeleteRegion = async(region_id: number): Promise<Boolean> => requestDelete("regions", region_id);
export const requestDeleteUser = async(user_id: number): Promise<Boolean> => requestDelete("users", user_id);
export const requestDeleteForestObservation = async(forestObservation_id: number): Promise<Boolean> => requestDelete("forest_observations", forestObservation_id);

// LAND COVER TYPES
export const getAllLandCoverTypes = async(): Promise<LandCoverType[]> => 
    fetchAll<LandCoverType>("land_cover_types");

export const requestCreateLandCoverType = async(lctForm: LCTCreate): Promise<Boolean> => 
    requestCreate<LCTCreate>("land_cover_types", lctForm);

export const requestDeleteLandCoverType = async(lct_id: number): Promise<Boolean> => 
    requestDelete("land_cover_types", lct_id);

// TODO: requestDeleteSubscription doesn't follow the simpler format as above so might be best to refactor, but using this for now
export const requestDeleteSubscription = async(user_id: number, metric_id: number, region_id: number): Promise<Boolean> =>
    requestDelete(`subscriptions/${user_id}/${metric_id}`, region_id)

export const getAllRegionClassifications = async(): Promise<RegionClassification[]> => 
    fetchAll<RegionClassification>("region_classifications");

export const requestCreateRegionClassification = async(rcForm: RegionClassificationCreate): Promise<Boolean> => 
    requestCreate<RegionClassificationCreate>("region_classifications", rcForm);

export const requestDeleteRegionClassification = async(lct_id: number, region_id: number): Promise<Boolean> => {
    try {
        await axios.delete(`${apiUrl}/region_classifications/${lct_id}/${region_id}`);
        return true;
    } catch (error) {
        console.error("Error deleting region classification:", error);
        return false;
    }
};
