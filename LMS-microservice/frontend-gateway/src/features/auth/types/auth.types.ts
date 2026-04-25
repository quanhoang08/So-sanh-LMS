export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (
    email: string, 
    password: string, 
    roleType: 'ADMIN' | 'STUDENT' | 'LECTURER'
  ) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (updatedInfo: any) => void;
}