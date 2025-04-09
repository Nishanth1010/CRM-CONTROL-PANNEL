'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export interface SignUpParams {
  fullName: string;
  bniId: string;
  email: string;
  mobileNumber: string;
  password: string;
}

interface SignInWithPasswordParams {
  email: string;
  password: string;
}

interface User {
  id: string;
  role: string;
  name: string;
  email: string;
  companyId: number;
  profileImg: string | null;
  companyName: string;
  accessLevel: string;
  companyAccess: string;
}

interface SignInResponse {
  token?: string;
  user?: User;
  error?: string;
}

export interface ResetPasswordParams {
  email: string;
}

interface DecodedToken extends JwtPayload {
  id: string;
  role: string;
  name: string;
  email: string;
  companyId: number;
  profileImg: string | null;
  companyName: string;
  accessLevel: string;
  companyAccess: string;
}

export interface ChangePasswordResponse {
  error?: string;
  message?: string;
  success?: boolean;
  passwordChanged?: boolean;
}

export interface ForgotPasswordResponse {
  error?: string;
  message?: string;
  success?: boolean;
}

export interface VerifyOtpResponse {
  error?: string;
  message?: string;
  success?: boolean;
}

export interface ResendOtpResponse {
  error?: string;
  message?: string;
  success?: boolean;
}

export interface sendEmailResponse {
  error?: string;
  message?: string;
  success?: boolean;
}

class AuthClient {
  async signUp(values: SignUpParams): Promise<{ error?: string }> {
    const { bniId, email, fullName, mobileNumber, password } = values;

    try {
      const res = await axios.post('/api/auth/register', {
        bniId,
        email,
        name: fullName,
        mobile: mobileNumber,
        password,
      });

      const { token, user: registeredUser } = res.data as { token: string; user: { id: string } };

      localStorage.setItem('custom-auth-token', token);
      localStorage.setItem('userId', registeredUser.id);

      return {}; // Return an empty object if the signup is successful
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return { error: error.response.data.message || 'An error occurred during sign-up' };
      } else {
        return { error: 'An unexpected error occurred' };
      }
    }
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<SignInResponse> {
    try {
      const { email, password } = params;
      const response = await axios.post('/api/auth/login', { email, password });

      const { auth, token, user } = response.data as {
        auth: boolean;
        token: string;
        user: User;
      };

      if (auth) {
        // Save the JWT token and user information in localStorage
        localStorage.setItem('custom-auth-token', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('companyId', user.companyId.toString());
        localStorage.setItem('companyName', user.companyName);
        localStorage.setItem('access', user.accessLevel);
        localStorage.setItem('name', user.name);
        localStorage.setItem('role', user.role);
        localStorage.setItem('companyAccess', user.companyAccess);

        // Only set profileImg if it's not null
        if (user.profileImg) {
          localStorage.setItem('profileImg', user.profileImg);
        } else {
          localStorage.removeItem('profileImg'); // Clear any existing value
        }

        return { token, user };
      }

      return { error: response.data.message || 'Login failed' };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          error: (error.response?.data?.message as string) || 'Login failed',
        };
      } else {
        return { error: (error as Error).message || 'An unexpected error occurred' };
      }
    }
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');

    if (!token || this.isTokenExpired(token)) {
      localStorage.removeItem('custom-auth-token');
      localStorage.removeItem('userId');
      localStorage.removeItem('companyId');
      localStorage.removeItem('access');

      return { data: null };
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const user: User = {
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        accessLevel: decodedToken.accessLevel,
        role: decodedToken.role,
        companyId: decodedToken.companyId,
        profileImg: decodedToken.profileImg,
        companyName: decodedToken.companyName,
        companyAccess: decodedToken.companyAccess,
      };

      return { data: user };
    } catch (error) {
      return { error: 'Failed to decode token' };
    }
  }

  async getRole(): Promise<{ role?: string; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');

    if (!token || this.isTokenExpired(token)) {
      localStorage.removeItem('custom-auth-token');
      localStorage.removeItem('userId');
      return { error: 'Token is missing or expired' };
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const role = decodedToken.role;
      return { role }; // Return the user's role
    } catch (error) {
      return { error: 'Failed to decode token' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('userId');
    return {};
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      if (!decodedToken.exp) {
        return true;
      }
      return decodedToken.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }


  async changePassword(email: string, newPassword: string): Promise<ChangePasswordResponse> {
    try {
      const response = await axios.post('/api/auth/change-password', { email, newPassword });
  
      if (response.data?.success) {
        return { success: true, message: response.data.message || 'Password changed successfully', passwordChanged: true };
      } else {
        return { success: false, message: response.data.message || 'Password change failed', passwordChanged: false };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false, message: error.response?.data?.message || 'Failed to change password', passwordChanged: false };
      } else {
        return { success: false, message: 'An unexpected error occurred', passwordChanged: false };
      }
    }
  }
  

  async verifyOtp(otp: string, email: string): Promise<VerifyOtpResponse> {
    try {
      const response = await axios.post('/api/auth/verify-otp', { otp, email });
      return response.data;
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  }

  async resendOtp(otp: string, email: string): Promise<ResendOtpResponse> {
    try {
      const response = await axios.post('/api/auth/send-otp', { email });
      return response.data;
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { error: 'Failed to send OTP' };
      } else {
        return { error: 'An unexpected error occurred' };
      }
    }
  }
}

export const authClient = new AuthClient();

export function useAuthClient() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const userResponse = await authClient.getUser();
      if (!userResponse.data) {
        router.refresh();
      }
    };

    checkUser();
  }, [router]);

  return authClient;
}