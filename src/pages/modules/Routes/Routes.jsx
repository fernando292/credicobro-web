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


  async function loadRoutes(
    id
  ) {

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


  async function loadClients(
    id
  ) {

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

        [name]: value

      })
    );

  }


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


      setRoutes(
        previous =>
          previous.map(
            route =>

              route.id ===
              selectedRoute.id

                ? {

                    ...route,

                    clientIds:
                      result.clientIds,

                    totalVisits:
                      result.totalVisits

                  }

                : route

          )
      );


      setSelectedRoute(
        previous =>

          previous

            ? {

                ...previous,

                clientIds:
                  result.clientIds,

                totalVisits:
                  result.totalVisits

              }

            : previous
      );


      setDetailRoute(
        previous =>

          previous?.id ===
          selectedRoute.id

            ? {

                ...previous,

                clientIds:
                  result.clientIds,

                totalVisits:
                  result.totalVisits

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


  function handleOpenRoute(
    route
  ) {

    setDetailRoute(
      route
    );

  }


  function handleRouteUpdated(
    updatedRoute
  ) {

    setRoutes(
      previous =>
        previous.map(
          route =>

            route.id ===
            updatedRoute.id

              ? {

                  ...route,

                  ...updatedRoute

                }

              : route

        )
    );


    setDetailRoute(
      previous =>

        previous?.id ===
        updatedRoute.id

          ? {

              ...previous,

              ...updatedRoute

            }

          : previous
    );

  }


  if (loading) {

    return (

      <section className="routes">

        <h2>
          Cargando rutas...
        </h2>

      </section>

    );

  }


  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const todayRoutes =
    routes.filter(
      route =>
        route.date === today
    );


  const clientsInRoutes =
    routes.reduce(
      (total, route) =>

        total +

        Number(
          route.totalVisits || 0
        ),

      0
    );


  const pendingVisits =
    routes.reduce(
      (total, route) =>

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
    routes.reduce(
      (total, route) =>

        total +

        Number(
          route.collected || 0
        ),

      0
    );


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


  const visibleClientIds =
    filteredClients.map(
      client =>
        client.id
    );


  const allVisibleSelected =
    visibleClientIds.length > 0 &&

    visibleClientIds.every(
      id =>
        selectedClients.includes(id)
    );


  return (

    <section className="routes">


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


      <div className="routes__summary">


        <div className="routes__card">

          <span>
            Rutas de hoy
          </span>


          <strong>
            {todayRoutes.length}
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

          : (

            <div className="routes__list">

              {
                routes.map(
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