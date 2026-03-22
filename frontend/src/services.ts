import axios, { type AxiosResponse } from 'axios';
import type { ServerErrorResponse, UserFormBackend, UserResponse } from './types';

// TODO: Ideally some structure like:
// const apiUrl =
//   `${location.protocol}//${location.hostname}:` +
//   `${location.port === '5173' ? '8080' : location.port}` +
//   `${import.meta.env.BASE_URL}/api`
// NOTE: This MUST be updated in future :^)
const apiUrl = "http://localhost:8000"

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
