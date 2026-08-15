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


function normalizeDate(value) {

  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .split("T")[0];

}


function normalizeId(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return String(value).trim();

}


function RouteDetails({
  companyId,
  route,
  onClose,
  onRouteUpdated
}) {

  const [
    currentRoute,
    setCurrentRoute
  ] = useState(route);

  const [
    visits,
    setVisits
  ] = useState([]);

  const [
    clients,
    setClients
  ] = useState([]);

  const [
    credits,
    setCredits
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    search,
    setSearch
  ] = useState("");

  const [
    filter,
    setFilter
  ] = useState("Todos");

  const [
    selectedVisit,
    setSelectedVisit
  ] = useState(null);

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    form,
    setForm
  ] = useState({

    status:
      "Pendiente",

    value:
      "",

    creditId:
      "",

    method:
      "Efectivo",

    date:
      getToday(),

    notes:
      ""

  });


  const routeId =
    currentRoute?.id;


  const routeDate =
    normalizeDate(
      currentRoute?.date
    );


  const routeClientIdsKey =
    useMemo(

      () =>

        JSON.stringify(

          Array.isArray(
            currentRoute?.clientIds
          )

            ? currentRoute.clientIds

            : []

        ),

      [
        currentRoute?.clientIds
      ]

    );


  const routeClientIdsList =
    useMemo(

      () => {

        try {

          return JSON.parse(
            routeClientIdsKey
          );

        } catch {

          return [];

        }

      },

      [
        routeClientIdsKey
      ]

    );


  /* ======================================================
     ACTUALIZAR RUTA
  ====================================================== */

  useEffect(() => {

    setCurrentRoute(
      route
    );

  }, [route]);


  /* ======================================================
     CARGAR DETALLE
  ====================================================== */

  useEffect(() => {

    let isMounted =
      true;


    async function loadRoute() {

      try {

        setLoading(
          true
        );


        const [
          visitData,
          clientsData,
          creditsData
        ] = await Promise.all([

          ensureRouteVisits(
            companyId,
            routeId,
            routeClientIdsList
          ),

          getClients(
            companyId
          ),

          getCredits(
            companyId
          )

        ]);


        if (!isMounted) {
          return;
        }


        setVisits(
          visitData
        );


        setClients(
          clientsData
        );


        setCredits(
          creditsData
        );


      } catch (error) {

        console.error(
          "Error cargando detalle de ruta:",
          error
        );

      } finally {

        if (isMounted) {

          setLoading(
            false
          );

        }

      }

    }


    if (
      companyId &&
      routeId
    ) {

      loadRoute();

    }


    return () => {

      isMounted =
        false;

    };

  }, [
    companyId,
    routeId,
    routeClientIdsKey
  ]);


  /* ======================================================
     CLIENTES POR ID
  ====================================================== */

  const clientsById =
    useMemo(

      () =>

        new Map(

          clients.map(
            client => [

              normalizeId(
                client.id
              ),

              client

            ]
          )

        ),

      [clients]

    );


  /* ======================================================
     CRÃ‰DITOS POR ID
  ====================================================== */

  const creditsById =
    useMemo(

      () =>

        new Map(

          credits.flatMap(
            credit =>

              [
                credit.id,
                credit.firestoreId,
                credit.creditId
              ]
                .map(
                  normalizeId
                )
                .filter(Boolean)
                .map(
                  creditId => [

                    creditId,

                    credit

                  ]
                )
          )

        ),

      [credits]

    );


  /* ======================================================
     CLIENTES DE RUTA
  ====================================================== */

  const routeClientIds =
    useMemo(

      () =>

        new Set(

          routeClientIdsList.map(
            normalizeId
          )

        ),

      [routeClientIdsList]

    );


  const routeClients =
    useMemo(

      () =>

        clients.filter(

          client =>

            routeClientIds.has(

              normalizeId(
                client.id
              )

            )

        ),

      [
        clients,
        routeClientIds
      ]

    );


  /* ======================================================
     VISITAS
  ====================================================== */

  const routeVisits =
    useMemo(

      () =>

        visits.filter(

          visit =>

            routeClientIds.has(

              normalizeId(
                visit.clientId
              )

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

  const displayedVisits =
    useMemo(() => {

      const value =
        search
          .toLowerCase()
          .trim();


      return routeVisits.filter(
        visit => {

          const client =
            clientsById.get(

              normalizeId(
                visit.clientId
              )

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

                String(
                  item || ""
                )
                  .toLowerCase()
                  .includes(
                    value
                  )

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
     ESTADÃSTICAS
  ====================================================== */

  const completedVisits =
    routeVisits.filter(

      visit =>
        visit.status !==
        "Pendiente"

    ).length;


  const collected =
    routeVisits.reduce(

      (
        total,
        visit
      ) =>

        total +

        Number(
          visit.collectedAmount ||
          0
        ),

      0

    );


  /* ======================================================
     CRÃ‰DITOS DEL CLIENTE
  ====================================================== */

  function getClientCredits(clientId) {

    const normalizedClientId =
      normalizeId(
        clientId
      );


    return credits.filter(

      credit =>

        normalizeId(
          credit.clientId
        ) ===
          normalizedClientId &&

        String(
          credit.status || ""
        ).trim() ===
          "Activo"

    );

  }


  /* ======================================================
     CRÃ‰DITO DIRECTO DE LA RUTA
  ====================================================== */

  function getRouteCreditId(
    clientId
  ) {

    const normalizedClientId =
      normalizeId(
        clientId
      );


    const creditByClient =
      currentRoute?.creditByClient &&
      typeof currentRoute.creditByClient === "object"
        ? currentRoute.creditByClient
        : {};


    const mappedCreditId =
      normalizeId(
        creditByClient[
          normalizedClientId
        ]
      );


    if (
      mappedCreditId
    ) {

      return mappedCreditId;

    }

    const directCreditId =
      normalizeId(
        currentRoute?.creditId
      );


    if (
      directCreditId
    ) {

      return directCreditId;

    }


    const routeCreditIds =
      Array.isArray(
        currentRoute?.creditIds
      )

        ? currentRoute.creditIds
            .map(normalizeId)
            .filter(Boolean)

        : [];


    if (
      routeCreditIds.length === 1
    ) {

      return routeCreditIds[0];

    }


    return "";

  }


  /* ======================================================
     BUSCAR CRÃ‰DITO DE LA RUTA
  ====================================================== */

  function getCreditForRoute(clientId) {

    const normalizedClientId =
      normalizeId(
        clientId
      );


    if (!normalizedClientId) {
      return null;
    }


    const routeCreditId =
      getRouteCreditId(
        normalizedClientId
      );


    if (
      routeCreditId
    ) {

      const directCredit =
        creditsById.get(
          routeCreditId
        );


      if (
        directCredit &&
        normalizeId(
          directCredit.clientId
        ) ===
          normalizedClientId
      ) {

        return directCredit;

      }

    }


    if (
      routeDate
    ) {

      const creditByDate =
        credits.find(

          credit =>

            normalizeId(
              credit.clientId
            ) ===
              normalizedClientId &&

            normalizeDate(
              credit.nextPaymentDate
            ) ===
              routeDate &&

            String(
              credit.status || ""
            ).trim() !==
              "Pagado"

        );


      if (
        creditByDate
      ) {

        return creditByDate;

      }

    }


    const clientCredits =
      getClientCredits(
        normalizedClientId
      );


    if (
      clientCredits.length === 1
    ) {

      return clientCredits[0];

    }


    return null;

  }


  /* ======================================================
     CRÃ‰DITO DEFINITIVO DE LA VISITA
  ====================================================== */

  function getCreditForVisit(visit) {

    if (!visit) {
      return null;
    }


    const visitCreditId =
      normalizeId(
        visit.creditId
      );


    if (
      visitCreditId
    ) {

      const visitCredit =
        creditsById.get(
          visitCreditId
        );


      if (
        visitCredit &&
        normalizeId(
          visitCredit.clientId
        ) ===
        normalizeId(
          visit.clientId
        )
      ) {

        return visitCredit;

      }

    }


    return getCreditForRoute(
      visit.clientId
    );

  }


  /* ======================================================
     CRÃ‰DITO INICIAL DE LA VISITA
  ====================================================== */

  function getInitialCreditId(visit) {

    const credit =
      getCreditForVisit(
        visit
      );


    if (
      credit?.id
    ) {

      return normalizeId(
        credit.id
      );

    }


    return "";

  }


  /* ======================================================
     ABRIR VISITA
  ====================================================== */

  function handleOpenVisit(visit) {

    const selectedCreditId =
      getInitialCreditId(
        visit
      );


    setSelectedVisit(
      visit
    );


    setForm({

      status:
        visit.status ||
        "Pendiente",

      value:
        "",

      creditId:
        selectedCreditId,

      method:
        "Efectivo",

      date:
        routeDate ||
        getToday(),

      notes:
        visit.notes ||
        ""

    });

  }


  /* ======================================================
     CERRAR VISITA
  ====================================================== */

  function handleCloseVisit() {

    setSelectedVisit(
      null
    );


    setForm({

      status:
        "Pendiente",

      value:
        "",

      creditId:
        "",

      method:
        "Efectivo",

      date:
        routeDate ||
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


    if (
      name === "creditId"
    ) {

      return;

    }


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


    if (
      !selectedVisit ||
      !routeId
    ) {

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


    const credit =
      getCreditForVisit(
        selectedVisit
      );


    const creditId =
      normalizeId(
        credit?.id
      );


    if (
      paymentStatus &&
      !creditId
    ) {

      alert(
        "Esta visita no tiene un crédito asociado a la ruta."
      );

      return;

    }


    const currentCredit =
      creditId
        ? creditsById.get(
            creditId
          )
        : null;


    if (
      paymentStatus &&
      !currentCredit
    ) {

      alert(
        "El crédito asociado a esta ruta no existe."
      );

      return;

    }


    if (
      paymentStatus &&
      value >
        Number(
          currentCredit.balance || 0
        )
    ) {

      alert(
        "El recaudo no puede superar el saldo del crédito."
      );

      return;

    }


    try {

      setSaving(
        true
      );


      const client =
        clientsById.get(

          normalizeId(
            selectedVisit.clientId
          )

        );


      const result =
        await registerRouteVisit(

          companyId,

          routeId,

          selectedVisit.id,

          {

            ...form,

            creditId:
              paymentStatus
                ? creditId
                : null,

            value:
              paymentStatus
                ? value
                : 0,

            date:
              paymentStatus
                ? form.date
                : routeDate,

            clientName:
              client?.name ||
              "Cliente"

          }

        );


      /* ==================================================
         ACTUALIZAR VISITA
      ================================================== */

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


      /* ==================================================
         ACTUALIZAR CRÃ‰DITO
      ================================================== */

      if (
        result.updatedCredit
      ) {

        setCredits(

          previous =>

            previous.map(

              item =>

                normalizeId(
                  item.id
                ) ===
                normalizeId(
                  result.updatedCredit.id
                )

                  ? {

                      ...item,

                      ...result.updatedCredit

                    }

                  : item

            )

        );

      }


      /* ==================================================
         ACTUALIZAR RUTA
      ================================================== */

      if (
        result.updatedRoute
      ) {

        setCurrentRoute(
          result.updatedRoute
        );


        onRouteUpdated?.(
          result.updatedRoute
        );

      }


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

      setSaving(
        false
      );

    }

  }


  /* ======================================================
     CLIENTE SELECCIONADO
  ====================================================== */

  const selectedClient =
    selectedVisit

      ? clientsById.get(

          normalizeId(
            selectedVisit.clientId
          )

        )

      : null;


  /* ======================================================
     CRÃ‰DITO SELECCIONADO
  ====================================================== */

  const selectedVisitCredit =
    selectedVisit
      ? getCreditForVisit(
          selectedVisit
        )
      : null;


  const selectedVisitCreditId =
    normalizeId(
      selectedVisitCredit?.id
    );


  const hasFixedRouteCredit =
    Boolean(
      selectedVisitCreditId
    );


  const requiresPayment =
    [
      "Cobrado",
      "Pago parcial"
    ].includes(
      form.status
    );


  /* ======================================================
     FORMATEAR DINERO
  ====================================================== */

  function formatMoney(value) {

    return Number(
      value || 0
    ).toLocaleString(
      "es-CO"
    );

  }


  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <div className="route-details-overlay">

      <section className="route-details">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="route-details__header">

          <div>

            <p>
              {
                currentRoute?.zone ||
                "Sin zona"
              }
            </p>

            <h2>
              {
                currentRoute?.name
              }
            </h2>

            <span>
              Fecha:{" "}
              {
                currentRoute?.date ||
                "-"
              }
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
              {
                completedVisits
              }
              {" / "}
              {
                routeVisits.length
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
                collected.toLocaleString(
                  "es-CO"
                )
              }
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

        <RouteMap
          route={currentRoute}
          clients={routeClients}
          visits={routeVisits}
        />


        {/* ==================================================
            FILTROS
        ================================================== */}

        <div className="route-details__toolbar">

          <input
            type="search"
            value={search}
            onChange={event =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Buscar cliente..."
          />


          <select
            value={filter}
            onChange={event =>
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
          loading

            ? (

              <div className="route-details__loading">
                Cargando visitas...
              </div>

            )

            : displayedVisits.length === 0

              ? (

                <div className="route-details__empty">
                  No hay visitas que coincidan con el filtro.
                </div>

              )

              : (

                <div className="route-visit-list">

                  {
                    displayedVisits.map(
                      visit => {

                        const client =
                          clientsById.get(

                            normalizeId(
                              visit.clientId
                            )

                          );


                        const statusClass =
                          (
                            visit.status ||
                            "Pendiente"
                          )
                            .toLowerCase()
                            .replace(
                              /\s/g,
                              "-"
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
                                className={
                                  `route-visit__status route-visit__status--${statusClass}`
                                }
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
                                  ).toLocaleString(
                                    "es-CO"
                                  )
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


      {/* ====================================================
          MODAL VISITA
      ==================================================== */}

      {
        selectedVisit && (

          <div className="route-visit-modal">

            <form
              className="route-visit-modal__content"
              onSubmit={handleSaveVisit}
            >

              {/* ==================================================
                  HEADER VISITA
              ================================================== */}

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
                  onClick={handleCloseVisit}
                >
                  ×
                </button>

              </div>


              {/* ==================================================
                  RESULTADO
              ================================================== */}

              <label>

                Resultado de la visita

                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
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


              {/* ==================================================
                  INFORMACIÓN DE PAGO
              ================================================== */}

              {
                requiresPayment && (

                  <>

                    {/* ==========================================
                        CRÉDITO ASOCIADO
                    ========================================== */}

                    <div className="route-visit-modal__credit">

                      {
                        hasFixedRouteCredit

                          ? (

                            <div className="route-credit-card">

                              <div className="route-credit-card__header">

                                <div className="route-credit-card__icon">
                                  $
                                </div>


                                <div className="route-credit-card__heading">

                                  <strong>
                                    Crédito asociado a esta ruta
                                  </strong>

                                  <span>
                                    Este crédito está vinculado a esta
                                    visita y no puede modificarse.
                                  </span>

                                </div>

                              </div>


                              <div className="route-credit-card__body">

                                <div className="route-credit-card__balance">

                                  <span>
                                    Saldo actual
                                  </span>

                                  <strong>
                                    $
                                    {
                                      formatMoney(
                                        selectedVisitCredit.balance
                                      )
                                    }
                                  </strong>

                                </div>


                                <div className="route-credit-card__reference">

                                  Crédito #

                                  {
                                    selectedVisitCreditId.slice(
                                      0,
                                      8
                                    )
                                  }

                                </div>

                              </div>

                            </div>

                          )

                          : (

                            <div className="route-credit-card route-credit-card--warning">

                              <div className="route-credit-card__header">

                                <div className="route-credit-card__icon">
                                  !
                                </div>


                                <div className="route-credit-card__heading">

                                  <strong>
                                    Crédito no asociado
                                  </strong>

                                  <span>
                                    Esta visita todavía no tiene un
                                    crédito correspondiente a la ruta.
                                  </span>

                                </div>

                              </div>

                            </div>

                          )

                      }

                    </div>


                    {/* ==========================================
                        AVISO SIN CRÉDITO
                    ========================================== */}

                    {
                      !hasFixedRouteCredit && (

                        <p className="route-visit-modal__warning">

                          No se puede registrar el pago hasta que la
                          visita tenga el crédito correspondiente a la ruta.

                        </p>

                      )
                    }


                    {/* ==========================================
                        VALOR Y MÉTODO
                    ========================================== */}

                    <div className="route-visit-modal__row">

                      <label>

                        Valor recaudado

                        <input
                          type="number"
                          min="1"
                          name="value"
                          value={form.value}
                          onChange={handleFormChange}
                          required
                        />

                      </label>


                      <label>

                        Método de pago

                        <select
                          name="method"
                          value={form.method}
                          onChange={handleFormChange}
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


                    {/* ==========================================
                        FECHA
                    ========================================== */}

                    <label>

                      Fecha del pago

                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleFormChange}
                        required
                      />

                    </label>

                  </>

                )
              }


              {/* ==================================================
                  OBSERVACIÓN
              ================================================== */}

              <label>

                Observación

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Ej. Cliente solicita visita el viernes."
                />

              </label>


              {/* ==================================================
                  ACCIONES
              ================================================== */}

              <div className="route-visit-modal__actions">

                <button
                  type="button"
                  onClick={handleCloseVisit}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  disabled={
                    saving ||
                    (
                      requiresPayment &&
                      !hasFixedRouteCredit
                    )
                  }
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