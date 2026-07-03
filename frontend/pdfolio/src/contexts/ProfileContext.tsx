import React, {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { apiCalls } from "@/services/api";

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

  const getProfileData = async () => {
    const { data, error } = await apiCalls.profile.getProfile(session);
    if (error) console.error(error);
    setProfileData(data);
  };

  useEffect(() => {
    if (session) {
      getProfileData();
    }
  }, [session]);
  return (
    <ProfileContext.Provider value={{ profileData, setProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};
export default ProfileContext;
