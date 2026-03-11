import {
  createContext, useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo
} from "react";
import { ProfileController, AuthController } from "../services";
import { Profile } from "../services/profile/types";
import { User } from "@supabase/supabase-js";

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  userRole: string | undefined;
  isLoading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  clearUserData: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileController = useMemo(() => new ProfileController(), []);
  const authController = useMemo(() => new AuthController(), []);

  const refreshUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const currentUser = await authController.getCurrentUser();
      
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setUserRole(undefined);
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      // Get profile data with role information
      const profileData = await profileController.getProfileByUserId(
        currentUser.id
      );
      setProfile(profileData);

      // Extract role name
      if (
        profileData?.role &&
        typeof profileData.role === "object" &&
        "name" in profileData.role
      ) {
        setUserRole(profileData.role.name);
      } else {
        setUserRole(undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [authController, profileController]);

  const clearUserData = () => {
    setUser(null);
    setProfile(null);
    setUserRole(undefined);
    setError(null);
    setIsLoading(false);
  };

  useEffect(() => {
    // Initial load
    refreshUserData();

    // Listen to auth state changes
    const { data: { subscription } } = authController.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          clearUserData();
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          // Use setTimeout to avoid async in callback as per Supabase docs
          setTimeout(async () => {
            await refreshUserData();
          }, 0);
        }
      }
    );

    return () => {
      // Cleanup subscription if needed
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [refreshUserData, authController]);

  const value: UserContextType = {
    user,
    profile,
    userRole,
    isLoading,
    error,
    refreshUserData,
    clearUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Export the context type for external use
export type { UserContextType };
