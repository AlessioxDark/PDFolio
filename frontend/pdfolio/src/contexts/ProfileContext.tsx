import React, { createContext, useContext, useEffect, useState } from "react";

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

  return (
    <ProfileContext.Provider value={{ profileData, setProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};
export default ProfileContext;
