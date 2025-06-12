const TOKEN_NAME = 'authToken'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_NAME);
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem(TOKEN_NAME);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_NAME, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_NAME);
}