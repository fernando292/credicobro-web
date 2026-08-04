import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";


import {
  onAuthStateChanged
} from "firebase/auth";


import {
  auth
} from "../config/firebase";


import {
  getUserProfile
} from "../pages/modules/services/company/companyService";



const AuthContext = createContext();





export function AuthProvider({ children }) {


  const [user, setUser] = useState(null);


  const [profile, setProfile] = useState(null);


  const [loading, setLoading] = useState(true);





  useEffect(() => {


    const unsubscribe = onAuthStateChanged(

      auth,

      async(currentUser)=>{



        if(currentUser){


          const userProfile = await getUserProfile(

            currentUser.uid

          );



          setUser(currentUser);


          setProfile(userProfile);



        }else{


          setUser(null);


          setProfile(null);


        }



        setLoading(false);



      }

    );



    return unsubscribe;



  }, []);







  return (


    <AuthContext.Provider


      value={{

        user,

        profile,

        loading


      }}


    >


      {children}


    </AuthContext.Provider>


  );

}






export function useAuth(){


  return useContext(AuthContext);


}