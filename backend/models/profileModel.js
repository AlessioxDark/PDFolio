const supabase = require("../config/db.cjs");
const getProfile = async (req, res) => {
  try {
    const { user } = req;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("handle,avatar_url,biography,full_name")
      .eq("profile_id", user.id)
      .single();
    if (profileError) throw profileError;
    const { data: userData, error: userDataError } = await supabase
      .from("utenti")
      .select("email")
      .eq("user_id", user.id)
      .single();
    if (userDataError) throw userDataError;
    return {
      data: { user_id: user.id, email: userData.email, ...profileData },
      error: null,
    };
  } catch (error) {
    return { data: null, error: err };
  }
};
const editProfile = async (req, res) => {
  try {
    const { user } = req;
    const { full_name, biography, avatar_url, handle } = req.body;
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name, biography, avatar_url, handle })
      .eq("profile_id", user.id);
    if (profileError) throw profileError;

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
module.exports = {
  getProfile,
  editProfile,
};
