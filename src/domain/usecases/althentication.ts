export interface Althentication {
  auth (email: string, password: string): Promise<string>
}
