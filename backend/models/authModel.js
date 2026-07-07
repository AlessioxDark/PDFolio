const supabase = require("../config/db.js");
const createProfile = async (req, res) => {
  try {
    const { user_id, email, full_name, handle } = req.body;
    const { data, error } = await supabase
      .from("utenti")
      .insert({ user_id, email })
      .select("*");
    if (error) throw error;
    const { data: profilesData, error: profileError } = await supabase
      .from("profiles")
      .insert({ full_name, handle, profile_id: user_id })
      .select("*");
    if (profileError) throw profileError;
    return { data: { ...data, ...profilesData }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

module.exports = {
  createProfile,
};
