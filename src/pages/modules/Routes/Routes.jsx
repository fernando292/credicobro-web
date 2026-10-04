
import {
  useEffect,
  useState
} from "react";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  useAuth
} from "../../../context/AuthContext";

import {
  getUserProfile
} from "../services/company/companyService";

import {
  getRoutes,
  createRoute,
  updateRoute,
  removeRoute,
  assignClientsToRoute
} from "../services/routes/routeService";

import {
  getClients
} from "../services/clients/clientService";

import RouteDetails from "../../../components/dashboard/routes/RouteDetails/RouteDetails";

import "./Routes.css";


/* ======================================================
   UTILIDADES DE FECHA

   Se utilizan fechas locales para evitar que
   toISOString() cambie el día por diferencias de zona
   horaria.
====================================================== */

function getLocalDateString(
  date = new Date()
) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;

}


function addDays(
  dateString,
  amount
) {

  if (!dateString) {
    return getLocalDateString();
  }


  const [
    year,
    month,
    day
  ] =
    dateString
      .split("-")
      .map(Number);


  const date =
    new Date(
      year,
      month - 1,
      day
    );


  date.setDate(
    date.getDate() + amount
  );


  return getLocalDateString(
    date
  );

}


function formatDisplayDate(
  dateString
) {

  if (!dateString) {
    return "";
  }


  const [
    year,
    month,
    day
  ] =
    dateString
      .split("-")
      .map(Number);


  const date =
    new Date(
      year,
      month - 1,
      day
    );


  return date.toLocaleDateString(
    "es-CO",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );

}


function Routes() {

  const {
    user
  } = useAuth();


  const location =
    useLocation();


  const navigate =
    useNavigate();


  const [
    routes,
    setRoutes
  ] = useState([]);


  const [
    clients,
    setClients
  ] = useState([]);


  const [
    companyId,
    setCompanyId
  ] = useState(null);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    showForm,
    setShowForm
  ] = useState(false);


  const [
    showClients,
    setShowClients
  ] = useState(false);


  const [
    selectedRoute,
    setSelectedRoute
  ] = useState(null);


  const [
    detailRoute,
    setDetailRoute
  ] = useState(null);


  const [
    selectedClients,
    setSelectedClients
  ] = useState([]);


  const [
    clientSearch,
    setClientSearch
  ] = useState("");


  const [
    savingClients,
    setSavingClients
  ] = useState(false);


  const [
    savingRoute,
    setSavingRoute
  ] = useState(false);


  const [
    deletingRoute,
    setDeletingRoute
  ] = useState(false);


  const [
    editingRoute,
    setEditingRoute
  ] = useState(null);


  const [
    form,
    setForm
  ] = useState({

    name: "",
    date: "",
    zone: "",
    description: ""

  });


  /* ======================================================
     FILTROS DE RUTAS

     today       = Hoy
     tomorrow    = Mañana
     pending     = Pendientes
     completed   = Completadas
     noCollection = Sin cobro
     all         = Todas
     date        = Fecha seleccionada en calendario
  ====================================================== */

  const [
    routeFilter,
    setRouteFilter
  ] = useState("today");


  const [
    selectedDate,
    setSelectedDate
  ] = useState(
    getLocalDateString()
  );


  /* ======================================================
     CARGAR RUTAS
  ====================================================== */

  async function loadRoutes(
    id
  ) {

    if (!id) {
      return [];
    }


    try {

      const data =
        await getRoutes(id);


      setRoutes(
        data
      );


      return data;


    } catch (error) {

      console.error(
        "Error cargando rutas:",
        error
      );


      return [];

    }

  }


  /* ======================================================
     CARGAR CLIENTES
  ====================================================== */

  async function loadClients(
    id
  ) {

    if (!id) {
      return;
    }


    try {

      const data =
        await getClients(id);


      setClients(
        data
      );


    } catch (error) {

      console.error(
        "Error cargando clientes:",
        error
      );

    }

  }


  /* ======================================================
     INICIALIZAR
  ====================================================== */

  useEffect(() => {

    async function init() {

      try {

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


        setCompanyId(
          id
        );


        await Promise.all([

          loadRoutes(id),

          loadClients(id)

        ]);


      } catch (error) {

        console.error(
          "Error inicializando rutas:",
          error
        );

      } finally {

        setLoading(
          false
        );

      }

    }


    init();

  }, [user]);


  /* ======================================================
     ABRIR RUTA DESDE OTRA PÁGINA
  ====================================================== */

  useEffect(() => {

    const routeId =
      location.state?.routeId;


    if (
      !routeId ||
      routes.length === 0
    ) {

      return;

    }


    const route =
      routes.find(
        item =>
          String(item.id) ===
          String(routeId)
      );


    if (!route) {
      return;
    }


    setDetailRoute(
      route
    );


    navigate(
      location.pathname,
      {
        replace: true,
        state: {}
      }
    );

  }, [
    routes,
    location.pathname,
    location.state,
    navigate
  ]);


  /* ======================================================
     CAMBIAR FORMULARIO
  ====================================================== */

  function handleChange(
    event
  ) {

    const {
      name,
      value
    } = event.target;


    setForm(
      previous => ({

        ...previous,

        [name]:
          value

      })
    );

  }


  /* ======================================================
     CREAR RUTA
  ====================================================== */

  function handleOpenCreateForm() {

    setEditingRoute(
      null
    );


    setForm({

      name: "",
      date: "",
      zone: "",
      description: ""

    });


    setShowForm(
      true
    );

  }


  /* ======================================================
     EDITAR RUTA
  ====================================================== */

  function handleOpenEditForm(
    route
  ) {

    setEditingRoute(
      route
    );


    setForm({

      name:
        route.name || "",

      date:
        route.date || "",

      zone:
        route.zone || "",

      description:
        route.description || ""

    });


    setShowForm(
      true
    );

  }


  /* ======================================================
     CERRAR FORMULARIO
  ====================================================== */

  function handleCloseForm() {

    if (savingRoute) {
      return;
    }


    setShowForm(
      false
    );


    setEditingRoute(
      null
    );


    setForm({

      name: "",
      date: "",
      zone: "",
      description: ""

    });

  }


  /* ======================================================
     GUARDAR RUTA
  ====================================================== */

  async function handleSubmitRoute(
    event
  ) {

    event.preventDefault();


    if (!companyId) {

      alert(
        "No se encontró la empresa del usuario."
      );

      return;

    }


    if (!form.name.trim()) {

      alert(
        "Ingresa el nombre de la ruta."
      );

      return;

    }


    if (!form.date) {

      alert(
        "Selecciona la fecha de la ruta."
      );

      return;

    }


    try {

      setSavingRoute(
        true
      );


      const routeData = {

        name:
          form.name.trim(),

        date:
          form.date,

        zone:
          form.zone.trim(),

        description:
          form.description.trim()

      };


      if (editingRoute) {

        await updateRoute(

          companyId,

          editingRoute.id,

          routeData

        );

      } else {

        await createRoute(

          companyId,

          routeData

        );

      }


      await loadRoutes(
        companyId
      );


      handleCloseForm();


    } catch (error) {

      console.error(

        editingRoute
          ? "Error editando ruta:"
          : "Error creando ruta:",

        error

      );


      alert(

        error.message ||
        "No fue posible guardar la ruta."

      );


    } finally {

      setSavingRoute(
        false
      );

    }

  }


  /* ======================================================
     ELIMINAR RUTA
  ====================================================== */

  async function handleDeleteRoute(
    route
  ) {

    if (
      !companyId ||
      !route?.id
    ) {

      return;

    }


    const confirmed =
      window.confirm(

        `¿Estás seguro de eliminar la ruta "${route.name}"?\n\nEsta acción eliminará la ruta y no se puede deshacer.`

      );


    if (!confirmed) {
      return;
    }


    try {

      setDeletingRoute(
        true
      );


      await removeRoute(

        companyId,

        route.id

      );


      setRoutes(
        previous =>
          previous.filter(
            item =>
              item.id !== route.id
          )
      );


      if (
        selectedRoute?.id ===
        route.id
      ) {

        handleCloseClients();

      }


      if (
        detailRoute?.id ===
        route.id
      ) {

        setDetailRoute(
          null
        );

      }


      if (
        editingRoute?.id ===
        route.id
      ) {

        handleCloseForm();

      }


    } catch (error) {

      console.error(
        "Error eliminando ruta:",
        error
      );


      alert(

        error.message ||
        "No fue posible eliminar la ruta."

      );


    } finally {

      setDeletingRoute(
        false
      );

    }

  }


  /* ======================================================
     ABRIR CLIENTES
  ====================================================== */

  function handleOpenClients(
    route
  ) {

    setSelectedRoute(
      route
    );


    setSelectedClients(

      Array.isArray(
        route.clientIds
      )

        ? route.clientIds

        : []

    );


    setClientSearch(
      ""
    );


    setShowClients(
      true
    );

  }


  /* ======================================================
     CERRAR CLIENTES
  ====================================================== */

  function handleCloseClients() {

    if (savingClients) {
      return;
    }


    setShowClients(
      false
    );


    setSelectedRoute(
      null
    );


    setSelectedClients(
      []
    );


    setClientSearch(
      ""
    );

  }


  /* ======================================================
     SELECCIONAR / DESELECCIONAR CLIENTE
  ====================================================== */

  function handleToggleClient(
    clientId
  ) {

    setSelectedClients(
      previous => {

        if (
          previous.includes(
            clientId
          )
        ) {

          return previous.filter(
            id =>
              id !== clientId
          );

        }


        return [

          ...previous,

          clientId

        ];

      }
    );

  }


  /* ======================================================
     SELECCIONAR TODOS
  ====================================================== */

  function handleSelectAll() {

    const visibleIds =
      filteredClients.map(
        client =>
          client.id
      );


    setSelectedClients(
      previous => {

        const allSelected =
          visibleIds.every(
            id =>
              previous.includes(id)
          );


        if (allSelected) {

          return previous.filter(
            id =>
              !visibleIds.includes(id)
          );

        }


        return [

          ...new Set([

            ...previous,

            ...visibleIds

          ])

        ];

      }
    );

  }


  /* ======================================================
     GUARDAR CLIENTES DE RUTA
  ====================================================== */

  async function handleSaveClients() {

    if (
      !companyId ||
      !selectedRoute
    ) {

      return;

    }


    try {

      setSavingClients(
        true
      );


      const result =
        await assignClientsToRoute(

          companyId,

          selectedRoute.id,

          selectedClients

        );


      const updatedRoute = {

        ...selectedRoute,

        clientIds:
          result.clientIds,

        totalVisits:
          result.totalVisits

      };


      setRoutes(
        previous =>
          previous.map(
            route =>

              route.id ===
              selectedRoute.id

                ? {

                    ...route,

                    ...updatedRoute

                  }

                : route

          )
      );


      setSelectedRoute(
        updatedRoute
      );


      setDetailRoute(
        previous =>

          previous?.id ===
          selectedRoute.id

            ? {

                ...previous,

                ...updatedRoute

              }

            : previous

      );


      handleCloseClients();


    } catch (error) {

      console.error(
        "Error asignando clientes:",
        error
      );


      alert(

        error.message ||
        "No fue posible guardar los clientes."

      );


    } finally {

      setSavingClients(
        false
      );

    }

  }


  /* ======================================================
     ABRIR DETALLE DE RUTA
  ====================================================== */

  function handleOpenRoute(
    route
  ) {

    setDetailRoute(
      route
    );

  }


  /* ======================================================
     ACTUALIZAR RUTA DESDE ROUTEDETAILS
     
     IMPORTANTE:
     RouteDetails puede mandar un updatedRoute
     parcial. Primero actualizamos localmente.
     
     Después volvemos a consultar Firestore para
     obtener los valores reales y completos.
  ====================================================== */

  async function handleRouteUpdated(
    updatedRoute
  ) {

    if (
      !updatedRoute?.id
    ) {

      return;

    }


    const routeId =
      updatedRoute.id;


    /* ==================================================
       ACTUALIZACIÓN INMEDIATA DE LA INTERFAZ
    ================================================== */

    setRoutes(
      previous =>
        previous.map(
          route =>

            String(route.id) ===
            String(routeId)

              ? {

                  ...route,

                  ...updatedRoute

                }

              : route

        )
    );


    setDetailRoute(
      previous =>

        previous &&
        String(previous.id) ===
        String(routeId)

          ? {

              ...previous,

              ...updatedRoute

            }

          : previous

    );


    /* ==================================================
       SINCRONIZAR CON FIRESTORE
       
       Esto es lo importante.
       Después del pago volvemos a traer las rutas.
    ================================================== */

    if (!companyId) {
      return;
    }


    try {

      const freshRoutes =
        await loadRoutes(
          companyId
        );


      const freshRoute =
        freshRoutes.find(
          route =>
            String(route.id) ===
            String(routeId)
        );


      if (!freshRoute) {
        return;
      }


      /* ================================================
         ACTUALIZAR ROUTE DETAILS CON DATOS REALES
      ================================================ */

      setDetailRoute(
        previous =>

          previous &&
          String(previous.id) ===
          String(routeId)

            ? {

                ...previous,

                ...freshRoute

              }

            : previous

      );


    } catch (error) {

      console.error(
        "Error sincronizando ruta después del cambio:",
        error
      );

    }

  }


  /* ======================================================
     LOADING
  ====================================================== */

  if (loading) {

    return (

      <section className="routes">

        <h2>
          Cargando rutas...
        </h2>

      </section>

    );

  }


  /* ======================================================
     FECHAS DE TRABAJO
  ====================================================== */

  const today =
    getLocalDateString();


  const tomorrow =
    addDays(
      today,
      1
    );


  /* ======================================================
     FILTROS DE RUTAS

     No modifican las rutas existentes.
     Solamente determinan cuáles se muestran.
  ====================================================== */

  const filteredRoutes =
    routes
      .filter(
        route => {

          switch (
            routeFilter
          ) {

            case "today":

              return (
                route.date ===
                today
              );


            case "tomorrow":

              return (
                route.date ===
                tomorrow
              );


            case "pending":

              return (
                route.status ===
                "Pendiente"
              );


            case "completed":

              return (
                route.status ===
                "Completada"
              );


            case "noCollection":

              return (
                Number(
                  route.collected || 0
                ) <= 0
              );


            case "date":

              return (
                route.date ===
                selectedDate
              );


            case "all":

            default:

              return true;

          }

        }
      )
      .sort(
        (
          first,
          second
        ) => {

          const firstDate =
            first.date || "";

          const secondDate =
            second.date || "";


          if (
            firstDate !==
            secondDate
          ) {

            return firstDate.localeCompare(
              secondDate
            );

          }


          return (
            first.name || ""
          ).localeCompare(
            second.name || "",
            "es",
            {
              sensitivity: "base"
            }
          );

        }
      );


  /* ======================================================
     RESUMEN DE LAS RUTAS VISIBLES

     El resumen ahora corresponde únicamente al filtro
     que el usuario está viendo.
  ====================================================== */

  const visibleRoutes =
    filteredRoutes;


  const clientsInRoutes =
    visibleRoutes.reduce(
      (
        total,
        route
      ) =>

        total +

        Number(
          route.totalVisits || 0
        ),

      0

    );


  const pendingVisits =
    visibleRoutes.reduce(
      (
        total,
        route
      ) =>

        total +

        Math.max(

          Number(
            route.totalVisits || 0
          ) -

          Number(
            route.completedVisits || 0
          ),

          0

        ),

      0

    );


  const collected =
    visibleRoutes.reduce(
      (
        total,
        route
      ) =>

        total +

        Number(
          route.collected || 0
        ),

      0

    );


  /* ======================================================
     TÍTULO DINÁMICO DEL LISTADO
  ====================================================== */

  let routesTitle =
    "Rutas de hoy";


  switch (
    routeFilter
  ) {

    case "tomorrow":

      routesTitle =
        "Rutas de mañana";

      break;


    case "pending":

      routesTitle =
        "Rutas pendientes";

      break;


    case "completed":

      routesTitle =
        "Rutas completadas";

      break;


    case "noCollection":

      routesTitle =
        "Rutas sin cobro";

      break;


    case "all":

      routesTitle =
        "Todas las rutas";

      break;


    case "date":

      routesTitle =
        `Rutas del ${formatDisplayDate(
          selectedDate
        )}`;

      break;


    case "today":

    default:

      routesTitle =
        "Rutas de hoy";

      break;

  }


  /* ======================================================
     FILTRAR CLIENTES
  ====================================================== */

  const filteredClients =
    clients.filter(
      client => {

        const value =
          clientSearch
            .toLowerCase()
            .trim();


        if (!value) {
          return true;
        }


        return (

          client.name
            ?.toLowerCase()
            .includes(value)

          ||

          client.document
            ?.toLowerCase()
            .includes(value)

          ||

          client.phone
            ?.toLowerCase()
            .includes(value)

        );

      }
    );


  /* ======================================================
     IDS VISIBLES
  ====================================================== */

  const visibleClientIds =
    filteredClients.map(
      client =>
        client.id
    );


  /* ======================================================
     TODOS SELECCIONADOS
  ====================================================== */

  const allVisibleSelected =
    visibleClientIds.length > 0 &&

    visibleClientIds.every(
      id =>
        selectedClients.includes(id)
    );


  /* ======================================================
     CAMBIAR FILTRO
  ====================================================== */

  function handleRouteFilter(
    filter
  ) {

    setRouteFilter(
      filter
    );


    if (
      filter ===
      "today"
    ) {

      setSelectedDate(
        today
      );

    }


    if (
      filter ===
      "tomorrow"
    ) {

      setSelectedDate(
        tomorrow
      );

    }

  }


  /* ======================================================
     CAMBIAR FECHA DESDE CALENDARIO
  ====================================================== */

  function handleDateChange(
    event
  ) {

    const value =
      event.target.value;


    if (!value) {
      return;
    }


    setSelectedDate(
      value
    );


    setRouteFilter(
      "date"
    );

  }


  /* ======================================================
     DÍA ANTERIOR
  ====================================================== */

  function handlePreviousDay() {

    const previousDate =
      addDays(
        selectedDate,
        -1
      );


    setSelectedDate(
      previousDate
    );


    setRouteFilter(
      "date"
    );

  }


  /* ======================================================
     DÍA SIGUIENTE
  ====================================================== */

  function handleNextDay() {

    const nextDate =
      addDays(
        selectedDate,
        1
      );


    setSelectedDate(
      nextDate
    );


    setRouteFilter(
      "date"
    );

  }


  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <section className="routes">


      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="routes__header">

        <div>

          <h1>
            Rutas
          </h1>


          <p>

            Organiza y controla las visitas
            de cobranza de tu operación.

          </p>

        </div>


        <button

          className="routes__add"

          type="button"

          onClick={
            handleOpenCreateForm
          }

        >

          + Nueva ruta

        </button>

      </div>


      {/* ==================================================
          FILTROS
      ================================================== */}

      <div className="routes__filters">


        <div className="routes__filter-buttons">


          <button

            type="button"

            className={
              `routes__filter-button ${
                routeFilter === "today"
                  ? "routes__filter-button--active"
                  : ""
              }`
            }

            onClick={() =>
              handleRouteFilter(
                "today"
              )
            }

          >

            Hoy

          </button>


          <button

            type="button"

            className={
              `routes__filter-button ${
                routeFilter === "tomorrow"
                  ? "routes__filter-button--active"
                  : ""
              }`
            }

            onClick={() =>
              handleRouteFilter(
                "tomorrow"
              )
            }

          >

            Mañana

          </button>


          <button

            type="button"

            className={
              `routes__filter-button ${
                routeFilter === "pending"
                  ? "routes__filter-button--active"
                  : ""
              }`
            }

            onClick={() =>
              handleRouteFilter(
                "pending"
              )
            }

          >

            Pendientes

          </button>


          <button

            type="button"

            className={
              `routes__filter-button ${
                routeFilter === "completed"
                  ? "routes__filter-button--active"
                  : ""
              }`
            }

            onClick={() =>
              handleRouteFilter(
                "completed"
              )
            }

          >

            Completadas

          </button>


          <button

            type="button"

            className={
              `routes__filter-button ${
                routeFilter === "noCollection"
                  ? "routes__filter-button--active"
                  : ""
              }`
            }

            onClick={() =>
              handleRouteFilter(
                "noCollection"
              )
            }

          >

            Sin cobro

          </button>


          <button

            type="button"

            className={
              `routes__filter-button ${
                routeFilter === "all"
                  ? "routes__filter-button--active"
                  : ""
              }`
            }

            onClick={() =>
              handleRouteFilter(
                "all"
              )
            }

          >

            Todas

          </button>

        </div>


        {/* ==================================================
            NAVEGACIÓN POR FECHA
        ================================================== */}

        <div className="routes__date-controls">


          <button

            type="button"

            className="routes__date-button"

            onClick={
              handlePreviousDay
            }

            aria-label="Día anterior"

            title="Día anterior"

          >

            ‹

          </button>


          <div className="routes__date-picker">


            <span>
              📅
            </span>


            <input

              type="date"

              value={
                selectedDate
              }

              onChange={
                handleDateChange
              }

              aria-label="Elegir fecha"

            />

          </div>


          <button

            type="button"

            className="routes__date-button"

            onClick={
              handleNextDay
            }

            aria-label="Día siguiente"

            title="Día siguiente"

          >

            ›

          </button>


        </div>

      </div>


      {/* ==================================================
          RESUMEN
      ================================================== */}

      <div className="routes__summary">


        <div className="routes__card">

          <span>
            Rutas mostradas
          </span>


          <strong>
            {visibleRoutes.length}
          </strong>

        </div>


        <div className="routes__card">

          <span>
            Clientes en ruta
          </span>


          <strong>
            {clientsInRoutes}
          </strong>

        </div>


        <div className="routes__card">

          <span>
            Visitas pendientes
          </span>


          <strong>
            {pendingVisits}
          </strong>

        </div>


        <div className="routes__card">

          <span>
            Recaudado
          </span>


          <strong>
            ${collected.toLocaleString()}
          </strong>

        </div>

      </div>


      {/* ==================================================
          TÍTULO DE RESULTADOS
      ================================================== */}

      {
        routes.length > 0 && (

          <div className="routes__results-header">

            <div>

              <h2>
                {routesTitle}
              </h2>


              <p>

                {
                  visibleRoutes.length
                }

                {" "}

                {
                  visibleRoutes.length === 1
                    ? "ruta encontrada"
                    : "rutas encontradas"
                }

              </p>

            </div>

          </div>

        )
      }


      {/* ==================================================
          LISTA / EMPTY
      ================================================== */}

      {
        routes.length === 0

          ? (

            <div className="routes__empty">

              <h2>
                No hay rutas creadas
              </h2>


              <p>

                Crea una ruta para comenzar
                a organizar las visitas de
                cobranza de tus clientes.

              </p>


              <button

                className="routes__empty-button"

                type="button"

                onClick={
                  handleOpenCreateForm
                }

              >

                Crear primera ruta

              </button>

            </div>

          )

          : visibleRoutes.length === 0

            ? (

              <div className="routes__empty routes__empty--filtered">

                <h2>
                  No hay rutas para este filtro
                </h2>


                <p>

                  No encontramos rutas que
                  coincidan con la vista seleccionada.

                </p>


                <button

                  className="routes__empty-button"

                  type="button"

                  onClick={() =>
                    handleRouteFilter(
                      "all"
                    )
                  }

                >

                  Ver todas las rutas

                </button>

              </div>

            )

            : (

              <div className="routes__list">

                {
                  visibleRoutes.map(
                    route => (

                      <div

                        className="routes__route-card"

                        key={
                          route.id
                        }

                      >

                        <div>

                          <h3>
                            {route.name}
                          </h3>


                          <p>

                            {
                              route.zone ||
                              "Sin zona"
                            }

                          </p>

                        </div>


                        <div>

                          <span>
                            Fecha
                          </span>


                          <strong>

                            {
                              route.date ||
                              "-"
                            }

                          </strong>

                        </div>


                        <div>

                          <span>
                            Visitas
                          </span>


                          <strong>

                            {
                              route.completedVisits ||
                              0
                            }

                            {" / "}

                            {
                              route.totalVisits ||
                              0
                            }

                          </strong>

                        </div>


                        <div>

                          <span>
                            Recaudado
                          </span>


                          <strong>

                            $

                            {
                              Number(
                                route.collected ||
                                0
                              ).toLocaleString()
                            }

                          </strong>

                        </div>


                        <div>

                          <span

                            className={
                              `route-status route-status--${
                                route.status ===
                                "Completada"

                                  ? "completed"

                                  : route.status ===
                                    "En progreso"

                                    ? "progress"

                                    : "pending"
                              }`
                            }

                          >

                            {
                              route.status ||
                              "Pendiente"
                            }

                          </span>

                        </div>


                        <div className="routes__route-actions">


                          <button

                            type="button"

                            className="routes__open-button"

                            onClick={() =>
                              handleOpenRoute(
                                route
                              )
                            }

                          >

                            Abrir ruta

                          </button>


                          <button

                            type="button"

                            className="routes__clients-button"

                            onClick={() =>
                              handleOpenClients(
                                route
                              )
                            }

                          >

                            Clientes

                            <span>

                              {
                                route.totalVisits ||
                                0
                              }

                            </span>

                          </button>


                          <button

                            type="button"

                            className="routes__edit-button"

                            onClick={() =>
                              handleOpenEditForm(
                                route
                              )
                            }

                          >

                            Editar

                          </button>


                          <button

                            type="button"

                            className="routes__delete-button"

                            onClick={() =>
                              handleDeleteRoute(
                                route
                              )
                            }

                            disabled={
                              deletingRoute
                            }

                          >

                            Eliminar

                          </button>

                        </div>

                      </div>

                    )
                  )
                }

              </div>

            )
      }


      {/* ==================================================
          MODAL CREAR / EDITAR RUTA
      ================================================== */}

      {
        showForm && (

          <div className="route-modal">

            <div className="route-modal__content">


              <div className="route-modal__header">

                <div>

                  <h2>

                    {
                      editingRoute
                        ? "Editar ruta"
                        : "Nueva ruta"
                    }

                  </h2>


                  <p>

                    {
                      editingRoute

                        ? "Modifica la información de la ruta."

                        : "Configura una nueva ruta de cobranza."

                    }

                  </p>

                </div>


                <button

                  type="button"

                  className="route-modal__close"

                  onClick={
                    handleCloseForm
                  }

                  disabled={
                    savingRoute
                  }

                >

                  ×

                </button>

              </div>


              <form
                onSubmit={
                  handleSubmitRoute
                }
              >


                <div className="route-form__group">

                  <label>
                    Nombre de la ruta
                  </label>


                  <input

                    type="text"

                    name="name"

                    value={
                      form.name
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Ej. Ruta Rionegro"

                    required

                  />

                </div>


                <div className="route-form__row">


                  <div className="route-form__group">

                    <label>
                      Fecha
                    </label>


                    <input

                      type="date"

                      name="date"

                      value={
                        form.date
                      }

                      onChange={
                        handleChange
                      }

                      required

                    />

                  </div>


                  <div className="route-form__group">

                    <label>
                      Zona
                    </label>


                    <input

                      type="text"

                      name="zone"

                      value={
                        form.zone
                      }

                      onChange={
                        handleChange
                      }

                      placeholder="Ej. Rionegro"

                    />

                  </div>

                </div>


                <div className="route-form__group">

                  <label>
                    Descripción
                  </label>


                  <textarea

                    name="description"

                    value={
                      form.description
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Información adicional de la ruta..."

                    rows="3"

                  />

                </div>


                <div className="route-form__actions">


                  <button

                    type="button"

                    className="route-form__cancel"

                    onClick={
                      handleCloseForm
                    }

                    disabled={
                      savingRoute
                    }

                  >

                    Cancelar

                  </button>


                  <button

                    type="submit"

                    className="route-form__submit"

                    disabled={
                      savingRoute
                    }

                  >

                    {
                      savingRoute

                        ? "Guardando..."

                        : editingRoute

                          ? "Guardar cambios"

                          : "Crear ruta"
                    }

                  </button>

                </div>

              </form>

            </div>

          </div>

        )
      }


      {/* ==================================================
          MODAL CLIENTES
      ================================================== */}

      {
        showClients &&
        selectedRoute && (

          <div className="route-modal">

            <div className="route-modal__content route-clients-modal">


              <div className="route-modal__header">

                <div>

                  <h2>
                    Clientes de la ruta
                  </h2>


                  <p>
                    {selectedRoute.name}
                  </p>

                </div>


                <button

                  type="button"

                  className="route-modal__close"

                  onClick={
                    handleCloseClients
                  }

                  disabled={
                    savingClients
                  }

                >

                  ×

                </button>

              </div>


              <div className="route-clients__toolbar">


                <input

                  type="text"

                  value={
                    clientSearch
                  }

                  onChange={event =>
                    setClientSearch(
                      event.target.value
                    )
                  }

                  placeholder="Buscar cliente..."

                />


                <button

                  type="button"

                  onClick={
                    handleSelectAll
                  }

                >

                  {
                    allVisibleSelected

                      ? "Deseleccionar todos"

                      : "Seleccionar todos"
                  }

                </button>

              </div>


              <div className="route-clients__count">

                <strong>
                  {
                    selectedClients.length
                  }
                </strong>


                {" "}

                clientes seleccionados

              </div>


              <div className="route-clients__list">


                {
                  filteredClients.length === 0

                    ? (

                      <div className="route-clients__empty">

                        <h3>
                          No hay clientes
                        </h3>


                        <p>

                          No encontramos clientes
                          con esa búsqueda.

                        </p>

                      </div>

                    )

                    : (

                      filteredClients.map(
                        client => {

                          const selected =
                            selectedClients.includes(
                              client.id
                            );


                          return (

                            <label

                              className={
                                `route-client ${
                                  selected
                                    ? "route-client--selected"
                                    : ""
                                }`
                              }

                              key={
                                client.id
                              }

                            >

                              <input

                                type="checkbox"

                                checked={
                                  selected
                                }

                                onChange={() =>
                                  handleToggleClient(
                                    client.id
                                  )
                                }

                              />


                              <div>

                                <strong>
                                  {client.name}
                                </strong>


                                <span>

                                  {
                                    client.document ||
                                    "Sin documento"
                                  }

                                </span>


                                <span>

                                  {
                                    client.phone ||
                                    "Sin teléfono"
                                  }

                                </span>

                              </div>

                            </label>

                          );

                        }
                      )

                    )
                }

              </div>


              <div className="route-form__actions">


                <button

                  type="button"

                  className="route-form__cancel"

                  onClick={
                    handleCloseClients
                  }

                  disabled={
                    savingClients
                  }

                >

                  Cancelar

                </button>


                <button

                  type="button"

                  className="route-form__submit"

                  onClick={
                    handleSaveClients
                  }

                  disabled={
                    savingClients
                  }

                >

                  {
                    savingClients

                      ? "Guardando..."

                      : `Guardar clientes (${selectedClients.length})`
                  }

                </button>

              </div>


            </div>

          </div>

        )
      }


      {/* ==================================================
          DETALLE DE RUTA
      ================================================== */}

      {
        detailRoute && (

          <RouteDetails

            companyId={
              companyId
            }

            route={
              detailRoute
            }

            onClose={() =>
              setDetailRoute(
                null
              )
            }

            onRouteUpdated={
              handleRouteUpdated
            }

          />

        )
      }


    </section>

  );

}


export default Routes;
