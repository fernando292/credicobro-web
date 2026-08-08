import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { useAuth } from "./AuthContext";

import { getUserProfile } from "../pages/modules/services/company/companyService";

import {
  searchCompanyData
} from "../pages/modules/services/search/searchService";



const SearchContext = createContext();



export function SearchProvider({ children }) {

  const { user } = useAuth();

  const [companyId, setCompanyId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);



  useEffect(() => {

    async function loadCompany() {

      if (!user) {

        setCompanyId(null);

        return;

      }



      try {

        const profile = await getUserProfile(
          user.uid
        );



        setCompanyId(
          profile?.companyId || null
        );

      } catch (error) {

        console.error(
          "Error obteniendo empresa para búsqueda",
          error
        );

        setCompanyId(null);

      }

    }



    loadCompany();

  }, [user]);



  useEffect(() => {

    const term = searchTerm.trim();



    if (!term || !companyId) {

      setResults([]);

      setLoading(false);

      return;

    }



    const timeout = setTimeout(async () => {

      try {

        setLoading(true);



        const data = await searchCompanyData(

          companyId,

          term

        );



        setResults(data);

      } catch (error) {

        console.error(
          "Error realizando búsqueda global",
          error
        );

        setResults([]);

      } finally {

        setLoading(false);

      }

    }, 300);



    return () => clearTimeout(timeout);

  }, [

    searchTerm,

    companyId

  ]);



  function clearSearch() {

    setSearchTerm("");

    setResults([]);

  }



  return (

    <SearchContext.Provider

      value={{

        searchTerm,

        setSearchTerm,

        results,

        loading,

        clearSearch

      }}

    >

      {children}

    </SearchContext.Provider>

  );

}



export function useSearch() {

  const context = useContext(
    SearchContext
  );



  if (!context) {

    throw new Error(
      "useSearch debe utilizarse dentro de SearchProvider"
    );

  }



  return context;

}