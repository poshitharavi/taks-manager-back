export interface UserPayload {
  sub: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  name: string;
  email: string;
  token: string;
}
