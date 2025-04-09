export interface  User {
  id: string;
  role: string;
  name: string;
  email: string;
  companyId: number;
  profileImg: string | null;
  companyName: string;
  accessLevel: string;

  [key: string]: unknown;
}
