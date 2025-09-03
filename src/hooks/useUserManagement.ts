import { useState, useCallback } from "react";

export interface UserFormData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role?: string;
  active?: boolean;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UseUserManagementResult {
  loading: boolean;
  error: string | null;
  registerUser: (data: UserFormData) => Promise<UserResponse>;
  createUser: (
    data: UserFormData,
    options?: { sendMail?: boolean }
  ) => Promise<UserResponse>;
  editUser: (data: UserFormData) => Promise<UserResponse>;
  activateUser: (userId: string) => Promise<UserResponse>;
  deactivateUser: (userId: string) => Promise<UserResponse>;
  deleteUser: (
    userId: string
  ) => Promise<{ message: string; deletedUserId: string }>;
  clearError: () => void;
}

function generateRandomPassword(length = 16) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let password = "";
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}

export function useUserManagement(): UseUserManagementResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // User self-registration (public)
  const registerUser = async (data: UserFormData): Promise<UserResponse> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Registration failed");
      return result as UserResponse;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: create user (with random password and optional email)
  const createUser = async (
    data: UserFormData,
    options?: { sendMail?: boolean }
  ): Promise<UserResponse> => {
    setLoading(true);
    setError(null);
    try {
      const randomPassword = generateRandomPassword();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, password: randomPassword }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "User creation failed");

      // If sendMail is true, send the credentials via email
      if (options?.sendMail) {
        try {
          const emailRes = await fetch("/api/admin/users/send-credentials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: data.email,
              password: randomPassword,
              name: data.name,
            }),
          });

          if (!emailRes.ok) {
            console.warn(
              "Failed to send credentials email, but user was created"
            );
          }
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
          // Don't fail the user creation if email fails
        }
      }

      // Return user and the generated password
      return {
        ...result,
        user: {
          ...result.user,
          password: randomPassword,
        },
      } as UserResponse;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "User creation failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: edit user
  const editUser = async (data: UserFormData): Promise<UserResponse> => {
    if (!data.id) throw new Error("User ID required");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "User update failed");
      return result as UserResponse;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "User update failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: activate user (set active: true)
  const activateUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "User activation failed");
      return result;
    } catch (err: any) {
      setError(err.message || "User activation failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: deactivate user (set active: false)
  const deactivateUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "User deactivation failed");
      return result;
    } catch (err: any) {
      setError(err.message || "User deactivation failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: delete user
  const deleteUser = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "User deletion failed");
      return result;
    } catch (err: any) {
      setError(err.message || "User deletion failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    registerUser,
    createUser,
    editUser,
    activateUser,
    deactivateUser,
    deleteUser,
    clearError,
  };
}

export default useUserManagement;
