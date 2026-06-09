const supabase = require("../config/db.js");
const globalSearch = async (req, res) => {
  try {
    return { data: { documentsData, foldersData }, error: null };
  } catch (error) {
    return { data: null, error: error };
  }
};
module.exports = {
  globalSearch,
};
