import {
  useEffect,
  useState
} from "react";


import {
  useAuth
} from "../context/AuthContext";


import {
  getUserProfile
} from "../pages/modules/services/company/companyService";


import {
  getClients
} from "../pages/modules/services/clients/clientService";


import {
  getCredits,
  createCredit,
  updateCredit,
  removeCredit
} from "../pages/modules/services/credit/creditService";






function useCredits(){


  const { user } = useAuth();



  const [companyId,setCompanyId] = useState(null);


  const [clients,setClients] = useState([]);


  const [credits,setCredits] = useState([]);









  useEffect(()=>{


    async function loadData(){


      if(!user) return;




      try{


        const profile = await getUserProfile(

          user.uid

        );



        if(!profile?.companyId) return;



        const currentCompanyId = profile.companyId;



        setCompanyId(

          currentCompanyId

        );





        const clientsData = await getClients(

          currentCompanyId

        );



        setClients(

          clientsData

        );






        const creditsData = await getCredits(

          currentCompanyId

        );



        setCredits(

          creditsData

        );



      }catch(error){


        console.error(

          "Error cargando créditos",

          error

        );


      }



    }




    loadData();



  },[user]);














  async function saveCredit(

    credit,

    editingCredit

  ){



    if(!companyId) return;





    try{



      if(editingCredit){



        await updateCredit(

          companyId,

          credit.id,

          credit

        );





        setCredits(prev =>


          prev.map(item =>


            String(item.id) === String(credit.id)


              ? {

                  ...item,

                  ...credit

                }


              : item


          )


        );





      }else{



        const newCredit = await createCredit(

          companyId,

          credit

        );





        setCredits(prev => [


          ...prev,


          newCredit


        ]);



      }





    }catch(error){


      console.error(

        "Error guardando crédito",

        error

      );


    }



  }













  async function deleteCredit(id){



    try{



      await removeCredit(

        companyId,

        id

      );





      setCredits(prev =>


        prev.filter(item =>


          String(item.id) !== String(id)


        )


      );



    }catch(error){


      console.error(

        "Error eliminando crédito",

        error

      );


    }



  }














  function updateCreditState(updatedCredit){



    setCredits(prev =>


      prev.map(item => {



        if(

          String(item.id) === String(updatedCredit.id)

        ){



          return {


            ...item,


            ...updatedCredit


          };



        }





        return item;



      })


    );



  }













  return {


    companyId,


    clients,


    credits,


    saveCredit,


    deleteCredit,


    updateCreditState


  };


}






export default useCredits;