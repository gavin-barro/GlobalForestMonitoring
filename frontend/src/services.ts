import axios, { type AxiosResponse } from 'axios';
import type { ForestObservationFormBackend, Metric, Region, TimePeriod, UserFormBackend, UserGet } from './types';

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
