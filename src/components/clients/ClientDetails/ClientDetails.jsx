import {
  X
} from "lucide-react";


import "./ClientDetails.css";



function ClientDetails({

  client,

  onClose

}) {



  if (!client) {


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



    </div>


  );


}


export default ClientDetails;