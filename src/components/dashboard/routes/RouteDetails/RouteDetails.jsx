
import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  getClients
} from "../../../../pages/modules/services/clients/clientService";

import {
  getCredits
} from "../../../../pages/modules/services/credit/creditService";

import {
  ensureRouteVisits,
  registerRouteVisit
} from "../../../../pages/modules/services/routes/routeVisitService";

import RouteMap from "../RouteMap/RouteMap";

import "./RouteDetails.css";


const VISIT_STATUS = [
  "Pendiente",
  "Cobrado",
  "Pago parcial",
  "No pagó",
  "No atendió",
  "Reprogramado"
];


function getToday() {
  return new Date()
    .toISOString()
    .split("T")[0];
}


function RouteDetails({
  companyId,
  route,
  onClose,
  onRouteUpdated
}) {

  const [visits, setVisits] = useState([]);

  const [clients, setClients] = useState([]);

  const [credits, setCredits] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("Todos");

  const [selectedVisit, setSelectedVisit] = useState(null);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    status: "Pendiente",
    value: "",
    creditId: "",
    method: "Efectivo",
    date: getToday(),
    notes: ""
  });


  /* ======================================================
     CARGAR DETALLE DE RUTA
  ====================================================== */

  useEffect(() => {

    async function loadRoute() {

      try {

        setLoading(true);

        const [
          visitData,
          clientsData,
          creditsData
        ] = await Promise.all([

          ensureRouteVisits(
            companyId,
            route.id,
            route.clientIds || []
          ),

          getClients(companyId),

          getCredits(companyId)

        ]);

        setVisits(visitData);

        setClients(clientsData);

        setCredits(creditsData);

      } catch (error) {

        console.error(
          "Error cargando detalle de ruta:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    if (
      companyId &&
      route?.id
    ) {

      loadRoute();

    }

  }, [
    companyId,
    route
  ]);


  /* ======================================================
     CLIENTES POR ID
  ====================================================== */

  const clientsById = useMemo(

    () =>
      new Map(
        clients.map(
          client => [
            client.id,
            client
          ]
        )
      ),

    [clients]

  );


  /* ======================================================
     CLIENTES DE LA RUTA
  ====================================================== */

  const routeClientIds = useMemo(

    () =>
      new Set(
        route.clientIds || []
      ),

    [route.clientIds]

  );


  const routeClients = useMemo(

    () =>
      clients.filter(
        client =>
          routeClientIds.has(
            client.id
          )
      ),

    [
      clients,
      routeClientIds
    ]

  );


  /* ======================================================
     VISITAS DE LA RUTA
  ====================================================== */

  const routeVisits = useMemo(

    () =>
      visits.filter(
        visit =>
          routeClientIds.has(
            visit.clientId
          )
      ),

    [
      visits,
      routeClientIds
    ]

  );


  /* ======================================================
     VISITAS MOSTRADAS
  ====================================================== */

  const displayedVisits = useMemo(() => {

    const value = search
      .toLowerCase()
      .trim();


    return routeVisits.filter(
      visit => {

        const client =
          clientsById.get(
            visit.clientId
          );


        const matchesFilter =
          filter === "Todos" ||
          visit.status === filter;


        const matchesSearch =
          !value ||
          [
            client?.name,
            client?.document,
            client?.phone
          ].some(
            item =>
              item
                ?.toLowerCase()
                .includes(value)
          );


        return (
          matchesFilter &&
          matchesSearch
        );

      }
    );

  }, [
    clientsById,
    filter,
    routeVisits,
    search
  ]);


  /* ======================================================
     ESTADÍSTICAS
  ====================================================== */

  const completedVisits =
    routeVisits.filter(
      visit =>
        visit.status !== "Pendiente"
    ).length;


  const collected =
    routeVisits.reduce(
      (
        total,
        visit
      ) =>
        total +
        Number(
          visit.collectedAmount || 0
        ),

      0
    );


  /* ======================================================
     CRÉDITOS DEL CLIENTE
  ====================================================== */

  function getClientCredits(clientId) {

    return credits.filter(
      credit =>
        String(
          credit.clientId
        ) === String(clientId) &&
        credit.status === "Activo"
    );

  }


  /* ======================================================
     ABRIR VISITA
  ====================================================== */

  function handleOpenVisit(visit) {

    const clientCredits =
      getClientCredits(
        visit.clientId
      );


    setSelectedVisit(visit);


    setForm({

      status:
        visit.status ||
        "Pendiente",

      value: "",

      creditId:
        clientCredits.length === 1
          ? clientCredits[0].id
          : "",

      method:
        "Efectivo",

      date:
        getToday(),

      notes:
        visit.notes || ""

    });

  }


  /* ======================================================
     CERRAR VISITA
  ====================================================== */

  function handleCloseVisit() {

    setSelectedVisit(null);


    setForm({

      status:
        "Pendiente",

      value: "",

      creditId:
        "",

      method:
        "Efectivo",

      date:
        getToday(),

      notes:
        ""

    });

  }


  /* ======================================================
     CAMBIAR FORMULARIO
  ====================================================== */

  function handleFormChange(event) {

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
     GUARDAR VISITA
  ====================================================== */

  async function handleSaveVisit(event) {

    event.preventDefault();


    if (!selectedVisit) {

      return;

    }


    const paymentStatus =
      [
        "Cobrado",
        "Pago parcial"
      ].includes(
        form.status
      );


    const value =
      Number(
        form.value || 0
      );


    if (
      paymentStatus &&
      value <= 0
    ) {

      alert(
        "Ingresa el valor recaudado."
      );

      return;

    }


    if (
      paymentStatus &&
      !form.creditId
    ) {

      alert(
        "Selecciona el crédito al que aplicar el pago."
      );

      return;

    }


    const credit =
      credits.find(
        item =>
          item.id ===
          form.creditId
      );


    if (
      paymentStatus &&
      value >
        Number(
          credit?.balance || 0
        )
    ) {

      alert(
        "El recaudo no puede superar el saldo del crédito."
      );

      return;

    }


    try {

      setSaving(true);


      const client =
        clientsById.get(
          selectedVisit.clientId
        );


      const result =
        await registerRouteVisit(

          companyId,

          route.id,

          selectedVisit.id,

          {

            ...form,

            value:
              paymentStatus
                ? value
                : 0,

            creditId:
              paymentStatus
                ? form.creditId
                : null,

            clientName:
              client?.name ||
              "Cliente"

          }

        );


      setVisits(
        previous =>

          previous.map(
            visit =>

              visit.id ===
              result.visit.id

                ? result.visit

                : visit

          )
      );


      if (
        result.updatedCredit
      ) {

        setCredits(
          previous =>

            previous.map(
              credit =>

                credit.id ===
                result.updatedCredit.id

                  ? {
                      ...credit,
                      ...result.updatedCredit
                    }

                  : credit

            )
        );

      }


      onRouteUpdated?.(
        result.updatedRoute
      );


      handleCloseVisit();

    } catch (error) {

      console.error(
        "Error registrando visita:",
        error
      );

      alert(
        error.message ||
        "No fue posible guardar la visita."
      );

    } finally {

      setSaving(false);

    }

  }


  /* ======================================================
     CLIENTE SELECCIONADO
  ====================================================== */

  const selectedClient =
    selectedVisit

      ? clientsById.get(
          selectedVisit.clientId
        )

      : null;


  const selectedClientCredits =
    selectedVisit

      ? getClientCredits(
          selectedVisit.clientId
        )

      : [];


  const requiresPayment =
    [
      "Cobrado",
      "Pago parcial"
    ].includes(
      form.status
    );


  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <div className="route-details-overlay">

      <section className="route-details">


        {/* ==================================================
            ENCABEZADO
        ================================================== */}

        <div className="route-details__header">

          <div>

            <p>
              {route.zone || "Sin zona"}
            </p>

            <h2>
              {route.name}
            </h2>

            <span>
              Fecha: {route.date || "-"}
            </span>

          </div>


          <button

            type="button"

            className="route-details__close"

            onClick={onClose}

          >

            ×

          </button>

        </div>


        {/* ==================================================
            RESUMEN
        ================================================== */}

        <div className="route-details__summary">


          <div>

            <span>
              Progreso
            </span>

            <strong>
              {completedVisits}
              {" / "}
              {routeVisits.length}
            </strong>

          </div>


          <div>

            <span>
              Recaudado
            </span>

            <strong>
              $
              {collected.toLocaleString()}
            </strong>

          </div>


          <div>

            <span>
              Pendientes
            </span>

            <strong>
              {
                routeVisits.length -
                completedVisits
              }
            </strong>

          </div>


        </div>


        {/* ==================================================
            MAPA
        ================================================== */}

        <div className="route-details__map">

          <div className="route-details__map-header">

            <div>

              <h3>
                Mapa de la ruta
              </h3>

              <p>
                Ubicación de los clientes y estado de sus visitas.
              </p>

            </div>

            <span>
              {routeClients.length} clientes
            </span>

          </div>


          <RouteMap

            clients={routeClients}

            visits={routeVisits}

          />

        </div>


        {/* ==================================================
            FILTROS
        ================================================== */}

        <div className="route-details__toolbar">


          <input

            type="search"

            value={search}

            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }

            placeholder="Buscar cliente..."

          />


          <select

            value={filter}

            onChange={
              event =>
                setFilter(
                  event.target.value
                )
            }

          >

            <option value="Todos">
              Todas las visitas
            </option>


            {
              VISIT_STATUS.map(
                status => (

                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>

                )
              )
            }

          </select>

        </div>


        {/* ==================================================
            VISITAS
        ================================================== */}

        {
          loading ? (

            <div className="route-details__loading">

              Cargando visitas...

            </div>

          ) : displayedVisits.length === 0 ? (

            <div className="route-details__empty">

              No hay visitas que coincidan
              con el filtro.

            </div>

          ) : (

            <div className="route-visit-list">

              {
                displayedVisits.map(
                  visit => {

                    const client =
                      clientsById.get(
                        visit.clientId
                      );


                    return (

                      <article
                        className="route-visit"
                        key={visit.id}
                      >


                        <div className="route-visit__client">

                          <strong>
                            {
                              client?.name ||
                              "Cliente eliminado"
                            }
                          </strong>

                          <span>
                            {
                              client?.phone ||
                              "Sin teléfono"
                            }
                          </span>

                        </div>


                        <div className="route-visit__result">


                          <span
                            className={`route-visit__status route-visit__status--${
                              (
                                visit.status ||
                                "Pendiente"
                              )
                                .toLowerCase()
                                .replace(
                                  /\s/g,
                                  "-"
                                )
                            }`}
                          >

                            {
                              visit.status ||
                              "Pendiente"
                            }

                          </span>


                          <strong>

                            $
                            {
                              Number(
                                visit.collectedAmount ||
                                0
                              ).toLocaleString()
                            }

                          </strong>

                        </div>


                        <button

                          type="button"

                          className="route-visit__action"

                          onClick={() =>
                            handleOpenVisit(
                              visit
                            )
                          }

                        >

                          {
                            visit.status ===
                            "Pendiente"

                              ? "Registrar visita"

                              : "Ver visita"
                          }

                        </button>


                      </article>

                    );

                  }
                )
              }

            </div>

          )
        }


      </section>


      {/* ==================================================
          MODAL DE VISITA
      ================================================== */}

      {
        selectedVisit && (

          <div className="route-visit-modal">


            <form

              className="route-visit-modal__content"

              onSubmit={
                handleSaveVisit
              }

            >


              <div className="route-visit-modal__header">


                <div>

                  <h3>
                    {
                      selectedClient?.name ||
                      "Cliente"
                    }
                  </h3>

                  <p>
                    {
                      selectedClient?.phone ||
                      "Sin teléfono"
                    }
                  </p>

                </div>


                <button

                  type="button"

                  onClick={
                    handleCloseVisit
                  }

                >

                  ×

                </button>

              </div>


              {/* RESULTADO */}

              <label>

                Resultado de la visita


                <select

                  name="status"

                  value={form.status}

                  onChange={
                    handleFormChange
                  }

                >

                  {
                    VISIT_STATUS.map(
                      status => (

                        <option
                          key={status}
                          value={status}
                        >

                          {status}

                        </option>

                      )
                    )
                  }

                </select>

              </label>


              {/* PAGO */}

              {
                requiresPayment && (

                  <>

                    <label>

                      Crédito


                      <select

                        name="creditId"

                        value={
                          form.creditId
                        }

                        onChange={
                          handleFormChange
                        }

                        required

                      >

                        <option value="">
                          Selecciona un crédito
                        </option>


                        {
                          selectedClientCredits.map(
                            credit => (

                              <option
                                key={credit.id}
                                value={credit.id}
                              >

                                Saldo: $
                                {
                                  Number(
                                    credit.balance ||
                                    0
                                  ).toLocaleString()
                                }

                              </option>

                            )
                          )
                        }

                      </select>

                    </label>


                    {
                      selectedClientCredits.length === 0 && (

                        <p className="route-visit-modal__warning">

                          Este cliente no tiene créditos activos
                          para recibir un pago.

                        </p>

                      )
                    }


                    <div className="route-visit-modal__row">


                      <label>

                        Valor recaudado


                        <input

                          type="number"

                          min="1"

                          name="value"

                          value={
                            form.value
                          }

                          onChange={
                            handleFormChange
                          }

                          required

                        />

                      </label>


                      <label>

                        Método de pago


                        <select

                          name="method"

                          value={
                            form.method
                          }

                          onChange={
                            handleFormChange
                          }

                        >

                          <option>
                            Efectivo
                          </option>

                          <option>
                            Transferencia
                          </option>

                          <option>
                            Otro
                          </option>

                        </select>

                      </label>


                    </div>


                    <label>

                      Fecha del pago


                      <input

                        type="date"

                        name="date"

                        value={
                          form.date
                        }

                        onChange={
                          handleFormChange
                        }

                        required

                      />

                    </label>

                  </>

                )
              }


              {/* OBSERVACIÓN */}

              <label>

                Observación


                <textarea

                  name="notes"

                  value={
                    form.notes
                  }

                  onChange={
                    handleFormChange
                  }

                  rows="3"

                  placeholder="Ej. Cliente solicita visita el viernes."

                />

              </label>


              {/* ACCIONES */}

              <div className="route-visit-modal__actions">


                <button

                  type="button"

                  onClick={
                    handleCloseVisit
                  }

                >

                  Cancelar

                </button>


                <button

                  type="submit"

                  disabled={saving}

                >

                  {
                    saving
                      ? "Guardando..."
                      : "Guardar visita"
                  }

                </button>


              </div>


            </form>

          </div>

        )
      }


    </div>

  );

}


export default RouteDetails;
