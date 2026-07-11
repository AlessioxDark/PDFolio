import React, {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { apiCalls } from "@/services/api";
import { useApi } from "./ApiContext";

export const ProfileContext = createContext({
  profileData: null,
  setProfileData: (arg) => {},
});
export const useProfile = () => {
  const context = useContext(ProfileContext);
  return context;
};

export const ProfileContextProvider = ({ children }) => {
  const [profileData, setProfileData] = useState(null);
  const { session } = useAuth();
  const { executeApiCall } = useApi();
  const getProfileData = async () => {
    executeApiCall(
      "get_profile",
      () => {
        return apiCalls.profile.getProfile(session);
      },
      {
        onSuccess: (data) => {
          setProfileData(data);
        },
        onError: (error) => {},
      },
    );
  };

  useEffect(() => {
    if (session) {
      getProfileData();
    }
  }, [session]);
  return (
    <ProfileContext.Provider
      value={{ profileData, setProfileData, getProfileData }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
export default ProfileContext;
