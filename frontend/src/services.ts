import axios, { type AxiosResponse } from 'axios';
import type { ForestObservationFormBackend, ForestObservationResponse, RegionFormBackend, RegionResponse, ServerErrorResponse, UserFormBackend, UserResponse } from './types';

// TODO: Ideally some structure like:
// const apiUrl =
//   `${location.protocol}//${location.hostname}:` +
//   `${location.port === '5173' ? '8080' : location.port}` +
//   `${import.meta.env.BASE_URL}/api`
// NOTE: This MUST be updated in future :^)
const apiUrl = "http://localhost:8000"

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
export async function requestNewRegion (userForm: RegionFormBackend): Promise<RegionResponse | ServerErrorResponse> {
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
