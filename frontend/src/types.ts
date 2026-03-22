export interface UserForm {
    username: string,
    email: string,
    account_type: string,
    password: string
}

// TODO: The backend should be modified to accept UserForm and intuit the other fields
export interface UserFormBackend {
    user_id: number;
    username: string;
    email: string;
    acct_type: 'Admin' | 'Researcher' | 'Subscriber' | 'Guest';
    pw_hash: string;
    creation_date: string; // YYYY-MM-DD
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
}

export interface ServerErrorResponse {
  reason: string;
  message: string;
  fieldName: string;
  error: boolean;
}
