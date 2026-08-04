import {
  useEffect,
  useState
} from "react";


import {
  getClientById
} from "../pages/modules/services/clients/clientService";



function useCreditDetails(credit){



  const [clientName,setClientName] = useState(
    "Sin cliente"
  );



  useEffect(()=>{



    async function loadClient(){



      if(!credit?.clientId){


        setClientName(
          "Sin cliente"
        );


        return;


      }






      try{



        const companyId = credit.companyId;



        if(!companyId){


          setClientName(
            "Sin cliente"
          );


          return;


        }






        const client = await getClientById(

          companyId,

          credit.clientId

        );





        setClientName(

          client?.name ||

          "Sin cliente"

        );





      }catch(error){



        console.error(

          "Error cargando cliente:",

          error

        );



        setClientName(

          "Sin cliente"

        );


      }



    }





    loadClient();





  },[credit]);







  return {


    clientName


  };


}



export default useCreditDetails;