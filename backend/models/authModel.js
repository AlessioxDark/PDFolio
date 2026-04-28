const supabase = require("../config/db.js");
const createProfile = async (req, res) => {
  try {
    const { user_id, email, full_name, handle } = req.body;

    const { data, error } = await supabase
      .from("utenti")
      .insert({ user_id, email, full_name, handle });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};

module.exports = {
  createProfile,
};
