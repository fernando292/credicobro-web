import {
  useEffect,
  useState
} from "react";

import { useAuth } from "../../../context/AuthContext";

import {
  getUserProfile
} from "../services/company/companyService";

import {
  getClients
} from "../services/clients/clientService";

import {
  getCredits
} from "../services/credit/creditService";

import "./Intelligence.css";


function Intelligence() {

  const { user } = useAuth();

  const [companyId, setCompanyId] = useState(null);

  const [clients, setClients] = useState([]);
  const [credits, setCredits] = useState([]);

  const [loading, setLoading] = useState(true);


  /* ======================================================
     CARGAR DATOS
  ====================================================== */

  useEffect(() => {

    async function loadData() {

      try {

        setLoading(true);


        if (!user) {
          return;
        }


        const profile =
          await getUserProfile(
            user.uid
          );


        if (!profile?.companyId) {
          return;
        }


        const id =
          profile.companyId;


        setCompanyId(id);


        const [
          clientsData,
          creditsData
        ] = await Promise.all([

          getClients(id),

          getCredits(id)

        ]);


        setClients(
          clientsData || []
        );

        setCredits(
          creditsData || []
        );


      } catch (error) {

        console.error(
          "Error cargando inteligencia de cobranza:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadData();

  }, [user]);


  /* ======================================================
     LOADING
  ====================================================== */

  if (loading) {

    return (

      <section className="intelligence">

        <div className="intelligence__loading">

          Cargando inteligencia de cobranza...

        </div>

      </section>

    );

  }


  /* ======================================================
     ESTADÍSTICAS BASE
  ====================================================== */

  const activeCredits =
    credits.filter(
      credit =>
        credit.status === "Activo"
    );


  const totalBalance =
    activeCredits.reduce(
      (
        total,
        credit
      ) =>
        total +
        Number(
          credit.balance || 0
        ),

      0
    );


  const overdueCredits =
    activeCredits.filter(
      credit =>
        Number(
          credit.daysOverdue || 0
        ) > 0
    );


  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <section className="intelligence">


      {/* ==================================================
          ENCABEZADO
      ================================================== */}

      <div className="intelligence__header">

        <div>

          <span className="intelligence__eyebrow">
            Inteligencia de cobranza
          </span>

          <h1>
            ¿A quién deberías cobrar primero?
          </h1>

          <p>
            Analiza el comportamiento de tu cartera
            y detecta dónde concentrar tus esfuerzos
            de cobranza.
          </p>

        </div>

      </div>


      {/* ==================================================
          RESUMEN
      ================================================== */}

      <div className="intelligence__summary">


        <article className="intelligence__card">

          <span>
            Clientes
          </span>

          <strong>
            {clients.length}
          </strong>

        </article>


        <article className="intelligence__card">

          <span>
            Créditos activos
          </span>

          <strong>
            {activeCredits.length}
          </strong>

        </article>


        <article className="intelligence__card">

          <span>
            Saldo pendiente
          </span>

          <strong>
            $
            {totalBalance.toLocaleString()}
          </strong>

        </article>


        <article className="intelligence__card">

          <span>
            Créditos vencidos
          </span>

          <strong>
            {overdueCredits.length}
          </strong>

        </article>


      </div>


      {/* ==================================================
          ESTADO
      ================================================== */}

      <div className="intelligence__section">

        <div className="intelligence__section-header">

          <div>

            <h2>
              Centro de decisiones
            </h2>

            <p>
              Aquí construiremos las recomendaciones
              automáticas de cobranza.
            </p>

          </div>

        </div>


        <div className="intelligence__empty">

          <div className="intelligence__empty-icon">
            IA
          </div>

          <h3>
            Motor de prioridad de cobranza
          </h3>

          <p>
            El siguiente paso será calcular un nivel
            de prioridad para cada cliente utilizando
            saldo, vencimiento, historial de pagos
            y comportamiento de la cartera.
          </p>

        </div>

      </div>


    </section>

  );

}


export default Intelligence;