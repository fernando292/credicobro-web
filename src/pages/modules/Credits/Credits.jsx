import {
  useState
} from "react";


import useCredits from "../../../hooks/useCredits";


import CreditTable from "../../../components/credits/CreditTable/CreditTable";

import CreditForm from "../../../components/credits/CreditForm/CreditForm";

import CreditDetails from "../../../components/credits/CreditDetails/CreditDetails";


import {
  formatCurrency
} from "../../../utils/currency";


import "./Credits.css";


/* ======================================================
   FECHA LOCAL
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


/* ======================================================
   NORMALIZAR FECHA

   Firestore puede entregar fechas como:
   - YYYY-MM-DD
   - Date
   - Timestamp
   - objetos con toDate()
====================================================== */

function normalizeDate(
  value
) {

  if (!value) {
    return "";
  }


  if (
    typeof value === "string"
  ) {

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        value
      )
    ) {

      return value;

    }


    const parsed =
      new Date(
        value
      );


    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {

      return getLocalDateString(
        parsed
      );

    }


    return value;

  }


  if (
    value?.toDate &&
    typeof value.toDate ===
      "function"
  ) {

    return getLocalDateString(
      value.toDate()
    );

  }


  if (
    value instanceof Date
  ) {

    return getLocalDateString(
      value
    );

  }


  if (
    typeof value === "object" &&
    typeof value.seconds ===
      "number"
  ) {

    const parsed =
      new Date(
        value.seconds * 1000
      );


    return getLocalDateString(
      parsed
    );

  }


  return "";

}


/* ======================================================
   SUMAR DÍAS
====================================================== */

function addDays(
  dateString,
  amount
) {

  const normalized =
    normalizeDate(
      dateString
    );


  if (!normalized) {
    return "";
  }


  const [
    year,
    month,
    day
  ] =
    normalized
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


/* ======================================================
   MOSTRAR FECHA
====================================================== */

function formatDisplayDate(
  dateString
) {

  const normalized =
    normalizeDate(
      dateString
    );


  if (!normalized) {
    return "";
  }


  const [
    year,
    month,
    day
  ] =
    normalized
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
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );

}


/* ======================================================
   FECHA PRÓXIMO PAGO
====================================================== */

function getCreditNextPaymentDate(
  credit
) {

  return normalizeDate(

    credit?.nextPaymentDate ||

    credit?.nextPayment ||

    credit?.paymentDate ||

    credit?.firstPayment ||

    ""

  );

}


/* ======================================================
   VENCIDO
====================================================== */

function isCreditOverdue(
  credit,
  today
) {

  if (
    !credit ||
    credit.status === "Pagado"
  ) {

    return false;

  }


  const nextPaymentDate =
    getCreditNextPaymentDate(
      credit
    );


  if (!nextPaymentDate) {
    return false;
  }


  return (
    nextPaymentDate <
    today
  );

}


/* ======================================================
   PRÓXIMO

   Hoy + próximos 3 días.
====================================================== */

function isCreditUpcoming(
  credit,
  today
) {

  if (
    !credit ||
    credit.status === "Pagado"
  ) {

    return false;

  }


  const nextPaymentDate =
    getCreditNextPaymentDate(
      credit
    );


  if (!nextPaymentDate) {
    return false;
  }


  const limit =
    addDays(
      today,
      3
    );


  return (

    nextPaymentDate >= today &&

    nextPaymentDate <= limit

  );

}


/* ======================================================
   COMPONENTE
====================================================== */

function Credits() {


  const {

    clients,

    credits,

    saveCredit,

    deleteCredit,

    updateCreditState

  } = useCredits();


  const [
    showForm,
    setShowForm
  ] = useState(false);


  const [
    selectedCredit,
    setSelectedCredit
  ] = useState(null);


  const [
    editingCredit,
    setEditingCredit
  ] = useState(null);


  const [
    creditFilter,
    setCreditFilter
  ] = useState("active");


  const [
    searchTerm,
    setSearchTerm
  ] = useState("");


  const [
    selectedDate,
    setSelectedDate
  ] = useState(
    getLocalDateString()
  );


  /* ====================================================
     GUARDAR
  ==================================================== */

  async function handleSave(
    credit
  ) {

    await saveCredit(
      credit,
      editingCredit
    );


    setEditingCredit(
      null
    );


    setShowForm(
      false
    );

  }


  /* ====================================================
     VER
  ==================================================== */

  function handleView(
    credit
  ) {

    setSelectedCredit(
      credit
    );

  }


  /* ====================================================
     EDITAR
  ==================================================== */

  function handleEdit(
    credit
  ) {

    setEditingCredit(
      credit
    );


    setShowForm(
      true
    );

  }


  /* ====================================================
     ELIMINAR
  ==================================================== */

  async function handleDelete(
    id
  ) {

    const confirmDelete =
      window.confirm(
        "¿Deseas eliminar este crédito?"
      );


    if (!confirmDelete) {
      return;
    }


    await deleteCredit(
      id
    );


    if (
      selectedCredit?.id ===
      id
    ) {

      setSelectedCredit(
        null
      );

    }

  }


  /* ====================================================
     NUEVO CRÉDITO
  ==================================================== */

  function handleNewCredit() {

    setEditingCredit(
      null
    );


    setShowForm(
      previous =>
        !previous
    );

  }


  /* ====================================================
     ACTUALIZAR DESDE DETALLES
  ==================================================== */

  function handleCreditUpdated(
    updatedCredit
  ) {

    console.log(
      "CREDITO FINAL EN MODULO:",
      updatedCredit
    );


    const refreshedCredit = {

      ...selectedCredit,

      ...updatedCredit

    };


    setSelectedCredit(
      refreshedCredit
    );


    updateCreditState(
      refreshedCredit
    );

  }


  /* ====================================================
     FECHA ACTUAL
  ==================================================== */

  const today =
    getLocalDateString();


  /* ====================================================
     BÚSQUEDA
  ==================================================== */

  const normalizedSearch =
    searchTerm
      .toLowerCase()
      .trim();


  /* ====================================================
     FILTRAR

     IMPORTANTE:
     "all" devuelve directamente todos los créditos.
  ==================================================== */

  let filteredCredits = [

    ...credits

  ];


  /* ====================================================
     FILTRO PRINCIPAL
  ==================================================== */

  if (
    creditFilter ===
    "active"
  ) {

    filteredCredits =
      filteredCredits.filter(
        credit =>
          credit.status ===
          "Activo"
      );

  }


  if (
    creditFilter ===
    "upcoming"
  ) {

    filteredCredits =
      filteredCredits.filter(
        credit =>
          isCreditUpcoming(
            credit,
            today
          )
      );

  }


  if (
    creditFilter ===
    "overdue"
  ) {

    filteredCredits =
      filteredCredits.filter(
        credit =>
          isCreditOverdue(
            credit,
            today
          )
      );

  }


  if (
    creditFilter ===
    "paid"
  ) {

    filteredCredits =
      filteredCredits.filter(
        credit =>
          credit.status ===
          "Pagado"
      );

  }


  if (
    creditFilter ===
    "date"
  ) {

    filteredCredits =
      filteredCredits.filter(
        credit =>
          getCreditNextPaymentDate(
            credit
          ) ===
          selectedDate
      );

  }


  /* ====================================================
     BÚSQUEDA

     Se ejecuta después del filtro de estado.
  ==================================================== */

  if (
    normalizedSearch
  ) {

    filteredCredits =
      filteredCredits.filter(
        credit => {

          const client =
            clients.find(
              item =>
                String(
                  item.id
                ) ===
                String(
                  credit.clientId
                )
            );


          const searchableValues = [

            credit.client,

            credit.clientName,

            credit.clientDocument,

            credit.document,

            credit.phone,

            credit.clientPhone,

            client?.name,

            client?.document,

            client?.phone

          ];


          return searchableValues.some(
            value =>

              String(
                value || ""
              )
                .toLowerCase()
                .includes(
                  normalizedSearch
                )
          );

        }
      );

  }


  /* ====================================================
     ORDENAR

     Se ordenan por próximo pago solamente cuando
     existe una fecha válida.
  ==================================================== */

  filteredCredits.sort(
    (
      first,
      second
    ) => {

      const firstDate =
        getCreditNextPaymentDate(
          first
        );


      const secondDate =
        getCreditNextPaymentDate(
          second
        );


      if (
        firstDate &&
        secondDate
      ) {

        const comparison =
          firstDate.localeCompare(
            secondDate
          );


        if (
          comparison !== 0
        ) {

          return comparison;

        }

      }


      if (
        firstDate &&
        !secondDate
      ) {

        return -1;

      }


      if (
        !firstDate &&
        secondDate
      ) {

        return 1;

      }


      const firstName =
        String(
          first.client ||
          first.clientName ||
          ""
        );


      const secondName =
        String(
          second.client ||
          second.clientName ||
          ""
        );


      return firstName.localeCompare(
        secondName,
        "es",
        {
          sensitivity:
            "base"
        }
      );

    }
  );


  /* ====================================================
     RESUMEN DINÁMICO
  ==================================================== */

  const visibleCredits =
    filteredCredits;


  const totalVisibleCredits =
    visibleCredits.length;


  const placedCapital =
    visibleCredits.reduce(
      (
        total,
        credit
      ) =>

        total +
        Number(
          credit.amount || 0
        ),

      0
    );


  const pendingBalance =
    visibleCredits.reduce(
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


  const collectedAmount =
    visibleCredits.reduce(
      (
        total,
        credit
      ) => {

        const paidAmount =
          Number(
            credit.paidAmount
          );


        if (
          Number.isFinite(
            paidAmount
          )
        ) {

          return (
            total +
            paidAmount
          );

        }


        const amount =
          Number(
            credit.amount || 0
          );


        const balance =
          Number(
            credit.balance || 0
          );


        return (
          total +
          Math.max(
            amount -
            balance,
            0
          )
        );

      },

      0
    );


  /* ====================================================
     TÍTULO
  ==================================================== */

  let creditsTitle =
    "Créditos activos";


  switch (
    creditFilter
  ) {

    case "upcoming":

      creditsTitle =
        "Próximos pagos";

      break;


    case "overdue":

      creditsTitle =
        "Créditos vencidos";

      break;


    case "paid":

      creditsTitle =
        "Créditos pagados";

      break;


    case "date":

      creditsTitle =
        `Créditos del ${formatDisplayDate(
          selectedDate
        )}`;

      break;


    case "all":

      creditsTitle =
        "Todos los créditos";

      break;


    case "active":

    default:

      creditsTitle =
        "Créditos activos";

      break;

  }


  /* ====================================================
     FILTRO
  ==================================================== */

  function handleCreditFilter(
    filter
  ) {

    setCreditFilter(
      filter
    );

  }


  /* ====================================================
     FECHA
  ==================================================== */

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


    setCreditFilter(
      "date"
    );

  }


  /* ====================================================
     RENDER
  ==================================================== */

  return (

    <section className="credits-page">


      <div className="credits-header">

        <div>

          <h1>
            Créditos
          </h1>

          <p>
            Gestiona préstamos, pagos y seguimiento financiero.
          </p>

        </div>


        <button
          onClick={
            handleNewCredit
          }
        >

          {
            showForm
              ? "Cerrar"
              : "Nuevo crédito"
          }

        </button>

      </div>


      <div className="credits-filters">


        <div className="credits-filter-buttons">


          <button
            type="button"
            className={
              `credits-filter-button ${
                creditFilter === "active"
                  ? "credits-filter-button--active"
                  : ""
              }`
            }
            onClick={() =>
              handleCreditFilter(
                "active"
              )
            }
          >
            Activos
          </button>


          <button
            type="button"
            className={
              `credits-filter-button ${
                creditFilter === "upcoming"
                  ? "credits-filter-button--active"
                  : ""
              }`
            }
            onClick={() =>
              handleCreditFilter(
                "upcoming"
              )
            }
          >
            Próximos
          </button>


          <button
            type="button"
            className={
              `credits-filter-button ${
                creditFilter === "overdue"
                  ? "credits-filter-button--active"
                  : ""
              }`
            }
            onClick={() =>
              handleCreditFilter(
                "overdue"
              )
            }
          >
            Vencidos
          </button>


          <button
            type="button"
            className={
              `credits-filter-button ${
                creditFilter === "paid"
                  ? "credits-filter-button--active"
                  : ""
              }`
            }
            onClick={() =>
              handleCreditFilter(
                "paid"
              )
            }
          >
            Pagados
          </button>


          <button
            type="button"
            className={
              `credits-filter-button ${
                creditFilter === "all"
                  ? "credits-filter-button--active"
                  : ""
              }`
            }
            onClick={() =>
              handleCreditFilter(
                "all"
              )
            }
          >
            Todos
          </button>


        </div>


        <div className="credits-filter-tools">


          <div className="credits-search">

            <span>
              🔎
            </span>


            <input
              type="text"
              value={
                searchTerm
              }
              onChange={event =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Buscar cliente, documento o teléfono..."
              aria-label="Buscar crédito"
            />

          </div>


          <div className="credits-date-picker">

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
              aria-label="Filtrar por fecha de próximo pago"
            />

          </div>


        </div>


      </div>


      <div className="credits-stats">


        <div className="credit-card">

          <span>
            Créditos mostrados
          </span>

          <strong>
            {
              totalVisibleCredits
            }
          </strong>

        </div>


        <div className="credit-card">

          <span>
            Capital colocado
          </span>

          <strong>
            {
              formatCurrency(
                placedCapital
              )
            }
          </strong>

        </div>


        <div className="credit-card">

          <span>
            Recaudado
          </span>

          <strong>
            {
              formatCurrency(
                collectedAmount
              )
            }
          </strong>

        </div>


        <div className="credit-card">

          <span>
            Saldo pendiente
          </span>

          <strong>
            {
              formatCurrency(
                pendingBalance
              )
            }
          </strong>

        </div>


      </div>


      {
        showForm && (

          <CreditForm
            onSave={
              handleSave
            }
            creditToEdit={
              editingCredit
            }
            clients={
              clients
            }
          />

        )
      }


      <div className="credits-results-header">


        <div>

          <h2>
            {creditsTitle}
          </h2>


          <p>

            {
              totalVisibleCredits
            }

            {" "}

            {
              totalVisibleCredits === 1
                ? "crédito encontrado"
                : "créditos encontrados"
            }

          </p>

        </div>


        {
          searchTerm.trim() && (

            <button
              type="button"
              className="credits-clear-search"
              onClick={() =>
                setSearchTerm("")
              }
            >
              Limpiar búsqueda
            </button>

          )
        }


      </div>


      <div className="credits-main">


        <CreditTable

          credits={
            visibleCredits
          }

          onView={
            handleView
          }

          onEdit={
            handleEdit
          }

          onDelete={
            handleDelete
          }

        />


      </div>


      {
        selectedCredit && (

          <CreditDetails

            credit={
              selectedCredit
            }

            onClose={() =>
              setSelectedCredit(
                null
              )
            }

            onCreditUpdated={
              handleCreditUpdated
            }

          />

        )
      }


    </section>

  );

}


export default Credits;