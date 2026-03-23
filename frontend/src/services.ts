import axios, { type AxiosResponse } from 'axios';
import type { ForestObservationFormBackend, ForestObservationResponse, Metric, Region, RegionResponse, ServerErrorResponse, UserFormBackend, UserGet, UserResponse } from './types';

// TODO: Ideally some structure like:
// const apiUrl =
//   `${location.protocol}//${location.hostname}:` +
//   `${location.port === '5173' ? '8080' : location.port}` +
//   `${import.meta.env.BASE_URL}/api`
// NOTE: This MUST be updated in future :^)
const apiUrl = "http://localhost:8000"

// GET
/* Retrieve all users from the db */
export const getAllUsers = async(): Promise<UserGet[]> => {
    const response: AxiosResponse<UserGet[]> = await axios.get(
      `${apiUrl}/users/`
    );

    return response.data;
}

/* Retrieve all Regions from the db */
export const getAllRegions = async(): Promise<Region[]> => {
    const response: AxiosResponse<Region[]> = await axios.get(
      `${apiUrl}/regions/`
    );

    return response.data;
}

/* Retrieve all Metrics from the db */
export const getAllMetrics = async(): Promise<Metric[]> => {
    const response: AxiosResponse<Metric[]> = await axios.get(
      `${apiUrl}/metrics/`
    );

    return response.data;
}

// CREATE
// TODO: All of these can be likely merged into one function
/* Request create new user */
export async function requestNewUser (userForm: UserFormBackend): Promise<UserResponse | ServerErrorResponse> {
  try {
    const response: AxiosResponse<UserResponse> = await axios.post(
      `${apiUrl}/users/`,
      userForm
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Handle non-200 status codes
      const serverErrorResponse: ServerErrorResponse = error.response.data;
      return serverErrorResponse;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}

/* Request to create a new region */
export async function requestNewRegion (userForm: Region): Promise<RegionResponse | ServerErrorResponse> {
  try {
    const response: AxiosResponse<RegionResponse> = await axios.post(
      `${apiUrl}/regions/`,
      userForm
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Handle non-200 status codes
      const serverErrorResponse: ServerErrorResponse = error.response.data;
      return serverErrorResponse;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}

/* Request to create a new forest observation */
export async function requestNewForestObservation (userForm: ForestObservationFormBackend): Promise<ForestObservationResponse | ServerErrorResponse> {
  try {
    const response: AxiosResponse<ForestObservationResponse> = await axios.post(
      `${apiUrl}/forest_observations/`,
      userForm
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Handle non-200 status codes
      const serverErrorResponse: ServerErrorResponse = error.response.data;
      return serverErrorResponse;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}

// DELETE
/* Delete a user */
export async function requestDeleteUser (user_id: number): Promise<Boolean> {
  try {
    await axios.delete(`${apiUrl}/users/${user_id}`);

    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return false;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
}
