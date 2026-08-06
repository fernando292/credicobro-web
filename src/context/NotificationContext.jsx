import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";


import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";


import {
  db
} from "../config/firebase";


import {
  useAuth
} from "./AuthContext";


import {
  getUserProfile
} from "../pages/modules/services/company/companyService";


import {
  markAllNotificationsAsRead
} from "../pages/modules/services/notifications/notificationService";





const NotificationContext = createContext();






export function NotificationProvider({

  children

}) {



  const { user } = useAuth();



  const [notifications,setNotifications] = useState([]);


  const [companyId,setCompanyId] = useState(null);







  useEffect(()=>{



    let unsubscribe;



    async function loadNotifications(){



      if(!user){


        setNotifications([]);


        setCompanyId(null);


        return;


      }






      try{



        const profile = await getUserProfile(

          user.uid

        );





        if(!profile?.companyId) return;





        const company = String(

          profile.companyId

        );





        setCompanyId(company);








        const notificationsRef = collection(

          db,

          "notifications"

        );







        const q = query(


          notificationsRef,


          where(

            "companyId",

            "==",

            company

          ),



          orderBy(

            "createdAt",

            "desc"

          )


        );









        unsubscribe = onSnapshot(


          q,


          (snapshot)=>{





            const data = snapshot.docs.map(doc=>({


              id:doc.id,


              ...doc.data()


            }));






            setNotifications(data);




          }



        );






      }catch(error){



        console.error(

          "Error cargando notificaciones",

          error

        );



      }



    }







    loadNotifications();







    return ()=>{



      if(unsubscribe){


        unsubscribe();


      }



    };





  },[user]);













  const unreadCount = notifications.filter(


    item => !item.read


  ).length;









  async function markAllRead(){



    if(!companyId) return;





    try{



      await markAllNotificationsAsRead(

        companyId

      );



    }catch(error){



      console.error(

        "Error marcando notificaciones",

        error

      );


    }



  }









  return (



    <NotificationContext.Provider



      value={{


        notifications,


        unreadCount,


        companyId,


        markAllRead


      }}



    >



      {children}



    </NotificationContext.Provider>



  );



}








export function useNotifications(){


  return useContext(

    NotificationContext

  );


}