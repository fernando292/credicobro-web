import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  DollarSign,
  Phone,
  Route,
  Search,
  UserRound
} from "lucide-react";

import {
  useAuth
} from "../../../context/AuthContext";

import {
  getUserProfile
} from "../services/company/companyService";

import {
  getClients
} from "../services/clients/clientService";

import {
  getCredits
} from "../services/credit/creditService";

import {
  getAllCompanyPayments
} from "../services/payment/paymentGlobalService";

import {
  getRoutes
} from "../services/routes/routeService";

import {
  analyzeCollectionPortfolio
} from "../services/collection/collectionIntelligenceService";

import "./Collections.css";


const PRIORITY_FILTERS = [
  "Todos",
  "Alta",
  "Media",
  "Baja"
];


function formatMoney(value) {

  return `$${Number(
    value || 0
  ).toLocaleString("es-CO")}`;

}


function formatDate(value) {

  if (!value) {
    return "Sin fecha";
  }

  const date =
    value?.toDate
      ? value.toDate()
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Sin fecha";
  }

  return date.toLocaleDateString(
    "es-CO"
  );

}


function Collection() {

  const {
    user
  } = useAuth();

  const navigate =
    useNavigate();


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    analysis,
    setAnalysis
  ] = useState(null);


  const [
    routes,
    setRoutes
  ] = useState([]);


  const [
    search,
    setSearch
  ] = useState("");


  const [
    priority,
    setPriority
  ] = useState("Todos");


  useEffect(() => {

    async function loadCollection() {

      if (!user) {
        return;
      }

      try {

        setLoading(true);


        const profile =
          await getUserProfile(
            user.uid
          );


        if (!profile?.companyId) {
          return;
        }


        const companyId =
          profile.companyId;


        const [
          clients,
          credits,
          payments,
          companyRoutes
        ] = await Promise.all([

          getClients(
            companyId
          ),

          getCredits(
            companyId
          ),

          getAllCompanyPayments(
            companyId
          ),

          getRoutes(
            companyId
          )

        ]);


        const result =
          analyzeCollectionPortfolio({

            clients,
            credits,
            payments

          });


        setAnalysis(result);

        setRoutes(
          companyRoutes
        );


      } catch (error) {

        console.error(
          "Error cargando motor de cobranza:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadCollection();

  }, [user]);


  const filteredAnalysis =
    useMemo(() => {

      if (!analysis) {
        return [];
      }


      const value =
        search
          .toLowerCase()
          .trim();


      return analysis.analysis.filter(
        item => {

          const matchesPriority =
            priority === "Todos" ||
            item.priority === priority;


          const matchesSearch =
            !value ||
            item.clientName
              ?.toLowerCase()
              .includes(value);


          return (
            matchesPriority &&
            matchesSearch
          );

        }
      );

    }, [
      analysis,
      priority,
      search
    ]);


  function getClientRoute(
    clientId
  ) {

    if (!clientId) {
      return null;
    }


    return routes.find(
      route =>

        Array.isArray(
          route.clientIds
        ) &&

        route.clientIds.some(
          id =>
            String(id) ===
            String(clientId)
        )

    ) || null;

  }


  function handleOpenClient(
    clientId
  ) {

    if (!clientId) {
      return;
    }


    navigate(
      "/clientes",
      {
        state: {
          clientId
        }
      }
    );

  }


  function handleOpenRoute(
    clientId
  ) {

    const route =
      getClientRoute(
        clientId
      );


    if (!route) {
      return;
    }


    navigate(
      "/rutas",
      {
        state: {
          routeId: route.id
        }
      }
    );

  }


  if (loading) {

    return (

      <section className="collection">

        <div className="collection__loading">

          Analizando cartera...

        </div>

      </section>

    );

  }


  if (!analysis) {

    return (

      <section className="collection">

        <div className="collection__empty">

          No fue posible analizar la cartera.

        </div>

      </section>

    );

  }


  const {
    totals
  } = analysis;


  return (

    <section className="collection">


      <header className="collection__header">

        <div>

          <span className="collection__eyebrow">

            INTELIGENCIA DE COBRANZA

          </span>


          <h1>

            Motor de Cobranza

          </h1>


          <p>

            Prioriza automáticamente los clientes
            que requieren atención.

          </p>

        </div>


        <div className="collection__header-icon">

          <AlertTriangle size={28} />

        </div>

      </header>


      <div className="collection__stats">


        <article className="collection-stat collection-stat--danger">

          <div className="collection-stat__icon">

            <AlertTriangle size={21} />

          </div>


          <div>

            <span>
              Cobranza prioritaria
            </span>


            <strong>
              {totals.highPriority}
            </strong>

          </div>

        </article>


        <article className="collection-stat collection-stat--warning">

          <div className="collection-stat__icon">

            <Clock3 size={21} />

          </div>


          <div>

            <span>
              Atención media
            </span>


            <strong>
              {totals.mediumPriority}
            </strong>

          </div>

        </article>


        <article className="collection-stat collection-stat--money">

          <div className="collection-stat__icon">

            <DollarSign size={21} />

          </div>


          <div>

            <span>
              Saldo vencido
            </span>


            <strong>

              {formatMoney(
                totals.overdue
              )}

            </strong>

          </div>

        </article>


        <article className="collection-stat collection-stat--info">

          <div className="collection-stat__icon">

            <CalendarClock size={21} />

          </div>


          <div>

            <span>
              Próximos 3 días
            </span>


            <strong>
              {totals.dueSoonCount}
            </strong>

          </div>

        </article>


      </div>


      <div className="collection__insight">

        <div className="collection__insight-icon">

          <CheckCircle2 size={22} />

        </div>


        <div>

          <strong>
            Recomendación del sistema
          </strong>


          <p>

            {
              totals.highPriority > 0

                ? `Hay ${totals.highPriority} clientes que deberían ser atendidos primero.`

                : totals.dueSoonCount > 0

                  ? `No hay casos críticos. Hay ${totals.dueSoonCount} clientes próximos a vencer.`

                  : "La cartera no presenta situaciones prioritarias en este momento."

            }

          </p>

        </div>

      </div>


      <div className="collection__toolbar">


        <div className="collection__search">

          <Search size={18} />


          <input

            type="search"

            placeholder="Buscar cliente..."

            value={search}

            onChange={event =>
              setSearch(
                event.target.value
              )
            }

          />

        </div>


        <div className="collection__filters">

          {
            PRIORITY_FILTERS.map(
              item => (

                <button

                  key={item}

                  type="button"

                  className={
                    priority === item
                      ? "active"
                      : ""
                  }

                  onClick={() =>
                    setPriority(
                      item
                    )
                  }

                >

                  {item}

                </button>

              )
            )
          }

        </div>

      </div>


      <div className="collection__content">


        <div className="collection__content-header">

          <div>

            <h2>
              Clientes a gestionar
            </h2>


            <span>

              {filteredAnalysis.length}
              {" "}
              resultados

            </span>

          </div>

        </div>


        {
          filteredAnalysis.length === 0

            ? (

              <div className="collection__no-results">

                <UserRound size={30} />

                <p>

                  No hay clientes que coincidan
                  con los filtros.

                </p>

              </div>

            )

            : (

              <div className="collection__list">

                {
                  filteredAnalysis.map(
                    item => {

                      const clientRoute =
                        getClientRoute(
                          item.clientId
                        );


                      return (

                        <article

                          key={item.creditId}

                          className={
                            `collection-card collection-card--${item.priority.toLowerCase()}`
                          }

                        >

                          <div className="collection-card__priority">

                            <span>
                              {item.priority}
                            </span>


                            <strong>
                              {item.score}
                            </strong>

                          </div>


                          <div className="collection-card__client">

                            <div className="collection-card__avatar">

                              {item.clientName
                                ?.charAt(0)
                                ?.toUpperCase() || "C"}

                            </div>


                            <div>

                              <h3>
                                {item.clientName}
                              </h3>


                              <span>

                                <Phone size={13} />

                                {item.phone ||
                                  "Sin teléfono"}

                              </span>

                            </div>

                          </div>


                          <div className="collection-card__balance">

                            <span>
                              Saldo pendiente
                            </span>


                            <strong>

                              {formatMoney(
                                item.balance
                              )}

                            </strong>

                          </div>


                          <div className="collection-card__date">

                            <span>

                              <CalendarClock size={15} />

                              Próximo pago

                            </span>


                            <strong>

                              {formatDate(
                                item.nextPaymentDate
                              )}

                            </strong>

                          </div>


                          <div className="collection-card__reason">

                            <span>
                              {item.reason}
                            </span>

                          </div>


                          <div className="collection-card__actions">

                            <button

                              type="button"

                              onClick={() =>
                                handleOpenClient(
                                  item.clientId
                                )
                              }

                              disabled={!item.clientId}

                            >

                              <UserRound size={16} />

                              Cliente

                            </button>


                            <button

                              type="button"

                              onClick={() =>
                                handleOpenRoute(
                                  item.clientId
                                )
                              }

                              disabled={!clientRoute}

                              title={
                                clientRoute
                                  ? `Abrir ${clientRoute.name}`
                                  : "Este cliente no pertenece a ninguna ruta"
                              }

                            >

                              <Route size={16} />

                              Ruta

                            </button>

                          </div>

                        </article>

                      );

                    }
                  )
                }

              </div>

            )
        }

      </div>

    </section>

  );

}


export default Collection;