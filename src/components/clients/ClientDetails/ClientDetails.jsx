import {
  useEffect,
  useState
} from "react";


import {
  X
} from "lucide-react";


import {
  useAuth
} from "../../../context/AuthContext";


import {
  getUserProfile
} from "../../../pages/modules/services/company/companyService";


import {
  getClientFinancialSummary
} from "../../../pages/modules/services/clients/clientFinanceService";


import ClientFinancialSummary from "../ClientFinancialSummary/ClientFinancialSummary";


import "./ClientDetails.css";





function ClientDetails({

  client,

  onClose

}) {



  const { user } = useAuth();


  const [summary,setSummary] = useState(null);






  useEffect(()=>{


    async function loadSummary(){



      if(!user || !client) return;





      try{



        const profile = await getUserProfile(

          user.uid

        );





        if(!profile?.companyId) return;






        const data = await getClientFinancialSummary(

          profile.companyId,

          client.id

        );





        setSummary(data);





      }catch(error){



        console.error(

          "Error cargando resumen financiero",

          error

        );



      }



    }





    loadSummary();




  },[user,client]);









  if(!client){


    return (

      <div className="client-details empty">

        Selecciona un cliente para ver información

      </div>

    );


  }









  return (



    <div className="client-details">






      <button

        className="client-details__close"

        onClick={onClose}

      >

        <X size={20}/>


      </button>









      <div className="client-details__header">





        <div className="client-avatar">

          {client.name?.charAt(0)}

        </div>







        <div>


          <h2>

            {client.name}

          </h2>





          <span>

            {client.status}

          </span>




        </div>





      </div>









      <div className="client-details__info">





        <div>


          <label>

            Documento

          </label>


          <p>

            {client.document || "No registrado"}

          </p>


        </div>







        <div>


          <label>

            Teléfono

          </label>


          <p>

            {client.phone || "No registrado"}

          </p>


        </div>







        <div>


          <label>

            Correo

          </label>


          <p>

            {client.email || "No registrado"}

          </p>


        </div>







        <div>


          <label>

            Dirección

          </label>


          <p>

            {client.address || "No registrada"}

          </p>


        </div>





      </div>









      <ClientFinancialSummary

        summary={summary}

      />







    </div>



  );



}



export default ClientDetails;