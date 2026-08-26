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


  const [summary, setSummary] =
    useState(null);


  useEffect(() => {

    async function loadSummary() {

      if (!user || !client) {

        return;

      }


      try {

        const profile =
          await getUserProfile(
            user.uid
          );


        if (!profile?.companyId) {

          return;

        }


        const data =
          await getClientFinancialSummary(

            profile.companyId,

            client.id

          );


        setSummary(data);

      } catch (error) {

        console.error(

          "Error cargando resumen financiero",

          error

        );

      }

    }


    loadSummary();

  }, [user, client]);


  if (!client) {

    return (

      <div className="client-details empty">

        Selecciona un cliente para ver información

      </div>

    );

  }


  return (

    <div className="client-details">


      {/* ==================================================
         CERRAR
      ================================================== */}

      <button

        className="client-details__close"

        onClick={onClose}

        type="button"

        aria-label="Cerrar detalles del cliente"

      >

        <X size={20} />

      </button>


      {/* ==================================================
         ENCABEZADO
      ================================================== */}

      <div className="client-details__header">


        <div className="client-avatar">

          {client.name?.charAt(0) || "C"}

        </div>


        <div>

          <h2>

            {client.name}

          </h2>


          <span>

            {client.status || "Activo"}

          </span>

        </div>


      </div>


      {/* ==================================================
         INFORMACIÓN DEL CLIENTE
      ================================================== */}

      <div className="client-details__info">


        <div>

          <label>
            Documento
          </label>

          <p>

            {client.document ||
              "No registrado"}

          </p>

        </div>


        <div>

          <label>
            Teléfono
          </label>

          <p>

            {client.phone ||
              "No registrado"}

          </p>

        </div>


        <div>

          <label>
            Correo
          </label>

          <p>

            {client.email ||
              "No registrado"}

          </p>

        </div>


        <div>

          <label>
            Dirección
          </label>

          <p>

            {client.address ||
              "No registrada"}

          </p>

        </div>


      </div>


      {/* ==================================================
         PREFERENCIAS DE COMUNICACIÓN
      ================================================== */}

      <div className="client-details__communication">


        <h3>

          Preferencias de comunicación

        </h3>


        <div className="client-details__communication-list">


          {/* WHATSAPP */}

          <div className="client-details__communication-item">

            <span>

              WhatsApp

            </span>


            <strong
              className={
                client.whatsappEnabled
                  ? "enabled"
                  : "disabled"
              }
            >

              {client.whatsappEnabled
                ? "Habilitado"
                : "Deshabilitado"}

            </strong>

          </div>


          {/* SMS */}

          <div className="client-details__communication-item">

            <span>

              SMS

            </span>


            <strong
              className={
                client.smsEnabled
                  ? "enabled"
                  : "disabled"
              }
            >

              {client.smsEnabled
                ? "Habilitado"
                : "Deshabilitado"}

            </strong>

          </div>


          {/* EMAIL */}

          <div className="client-details__communication-item">

            <span>

              Correo electrónico

            </span>


            <strong
              className={
                client.emailEnabled
                  ? "enabled"
                  : "disabled"
              }
            >

              {client.emailEnabled
                ? "Habilitado"
                : "Deshabilitado"}

            </strong>

          </div>


        </div>


      </div>


      {/* ==================================================
         RESUMEN FINANCIERO
      ================================================== */}

      <ClientFinancialSummary

        summary={summary}

      />


    </div>

  );

}


export default ClientDetails;