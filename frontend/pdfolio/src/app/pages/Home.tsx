import React, { useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { apiCalls } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import Searchbar from "../../components/Searchbar";
import { useState } from "react";

const Home = () => {
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  async function loadData() {
    return await apiCalls.home.getHomeFoldersAndFiles(session?.access_token);
  }

  useEffect(() => {
    loadData();
  }, []);
  return (
    <div className="flex flex-row w-full">
      <Sidebar />
      <div className="px-4 py-3 w-full h-screen">
        <header className="w-full px-2 py-2.5 flex flex-row gap-4 items-center">
          <img src="https://placehold.co/50x50" alt="" />
          <span className="text-black font-bold text-3xl">PDFolio</span>
        </header>
        <div className="w-full flex justify-center flex-col items-center">
          <Searchbar query={query} setQuery={setQuery} />
          <div className="w-7/10"></div>
        </div>
        {query == "" ? <div></div> : <span>Risultati della ricerca</span>}{" "}
      </div>
      <h1 className="bg-purple-600">test</h1>
    </div>
  );
};

export default Home;
