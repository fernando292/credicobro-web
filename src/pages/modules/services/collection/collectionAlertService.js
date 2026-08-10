/* ======================================================
   CENTRO DE ALERTAS DE COBRANZA
====================================================== */


/* ======================================================
   CONFIGURACIÓN
====================================================== */

const ALERT_DAYS = {
  TODAY: 0,
  SOON: 3
};


/* ======================================================
   UTILIDADES DE FECHA
====================================================== */

function parseDate(value) {

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;

}


function getToday() {

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;

}


function getDaysDifference(date) {

  const today = getToday();

  const target = parseDate(date);

  if (!target) {
    return null;
  }

  const difference =
    target.getTime() -
    today.getTime();

  return Math.round(
    difference / (1000 * 60 * 60 * 24)
  );

}


/* ======================================================
   FORMATEAR DINERO
====================================================== */

function formatMoney(value) {

  return Number(
    value || 0
  ).toLocaleString("es-CO");

}


/* ======================================================
   CREAR ALERTA
====================================================== */

function createAlert({

  id,

  type,

  priority,

  title,

  message,

  creditId,

  clientId,

  clientName,

  amount = 0,

  date = null

}) {

  return {

    id,

    type,

    priority,

    title,

    message,

    creditId,
    clientId,
    clientName,

    amount,

    date

  };

}


/* ======================================================
   GENERAR ALERTAS DE CRÉDITOS
====================================================== */

export function generateCollectionAlerts({

  credits = [],

  payments = []

}) {

  const alerts = [];


  /* ====================================================
     PAGOS POR CRÉDITO
  ==================================================== */

  const paymentsByCredit = new Map();


  payments.forEach(payment => {

    const creditId =
      String(
        payment.creditId || ""
      );


    if (!creditId) {
      return;
    }


    if (
      !paymentsByCredit.has(
        creditId
      )
    ) {

      paymentsByCredit.set(
        creditId,
        []
      );

    }


    paymentsByCredit
      .get(creditId)
      .push(payment);

  });


  /* ====================================================
     ANALIZAR CADA CRÉDITO
  ==================================================== */

  credits.forEach(credit => {

    if (
      credit.status !== "Activo"
    ) {

      return;

    }


    const creditId =
      String(
        credit.id
      );


    const clientId =
      String(
        credit.clientId || ""
      );


    const clientName =
      credit.client ||
      "Cliente";


    const balance =
      Number(
        credit.balance || 0
      );


    const installmentValue =
      Number(
        credit.installmentValue || 0
      );


    const nextPaymentDate =
      credit.nextPaymentDate ||
      credit.firstPayment;


    /* ==================================================
       CRÉDITO SIN SALDO
    ================================================== */

    if (balance <= 0) {

      return;

    }


    /* ==================================================
       FECHA DEL PRÓXIMO PAGO
    ================================================== */

    const daysUntilPayment =
      getDaysDifference(
        nextPaymentDate
      );


    /* ==================================================
       COBRO VENCIDO
    ================================================== */

    if (
      daysUntilPayment !== null &&
      daysUntilPayment < 0
    ) {

      const overdueDays =
        Math.abs(
          daysUntilPayment
        );


      alerts.push(

        createAlert({

          id:
            `overdue-${creditId}`,

          type:
            "overdue",

          priority:
            "high",

          title:
            "Cobro vencido",

          message:
            `${clientName} tiene un pago vencido hace ${overdueDays} día${overdueDays === 1 ? "" : "s"}.`,

          creditId,

          clientId,

          clientName,

          amount:
            installmentValue,

          date:
            nextPaymentDate

        })

      );

    }


    /* ==================================================
       COBRO PARA HOY
    ================================================== */

    else if (
      daysUntilPayment ===
      ALERT_DAYS.TODAY
    ) {

      alerts.push(

        createAlert({

          id:
            `today-${creditId}`,

          type:
            "today",

          priority:
            "high",

          title:
            "Cobro para hoy",

          message:
            `${clientName} tiene un pago programado para hoy.`,

          creditId,

          clientId,

          clientName,

          amount:
            installmentValue,

          date:
            nextPaymentDate

        })

      );

    }


    /* ==================================================
       COBRO PRÓXIMO
    ================================================== */

    else if (
      daysUntilPayment !== null &&
      daysUntilPayment > 0 &&
      daysUntilPayment <=
        ALERT_DAYS.SOON
    ) {

      alerts.push(

        createAlert({

          id:
            `soon-${creditId}`,

          type:
            "upcoming",

          priority:
            "medium",

          title:
            "Cobro próximo",

          message:
            `${clientName} tiene un pago programado en ${daysUntilPayment} día${daysUntilPayment === 1 ? "" : "s"}.`,

          creditId,

          clientId,

          clientName,

          amount:
            installmentValue,

          date:
            nextPaymentDate

        })

      );

    }


    /* ==================================================
       ÚLTIMO PAGO DEL CRÉDITO
    ================================================== */

    const creditPayments =
      paymentsByCredit.get(
        creditId
      ) || [];


    if (
      creditPayments.length > 0
    ) {

      const sortedPayments =
        [...creditPayments]
          .sort(
            (a, b) =>
              new Date(b.date) -
              new Date(a.date)
          );


      const lastPayment =
        sortedPayments[0];


      const daysSincePayment =
        getDaysDifference(
          lastPayment.date
        );


      /* ================================================
         SIN PAGO RECIENTE
      ================================================ */

      if (
        daysSincePayment !== null &&
        daysSincePayment >= 14
      ) {

        alerts.push(

          createAlert({

            id:
              `inactive-${creditId}`,

            type:
              "inactive",

            priority:
              "high",

            title:
              "Cliente sin pago reciente",

            message:
              `${clientName} lleva ${daysSincePayment} días sin registrar un pago.`,

            creditId,

            clientId,

            clientName,

            amount:
              balance,

            date:
              lastPayment.date

          })

        );

      }

    }


    /* ==================================================
       SALDO ALTO
    ================================================== */

    const originalTotal =
      Number(
        credit.total ||
        credit.amount ||
        0
      );


    if (
      originalTotal > 0 &&
      balance / originalTotal >= 0.75
    ) {

      alerts.push(

        createAlert({

          id:
            `high-balance-${creditId}`,

          type:
            "high_balance",

          priority:
            "medium",

          title:
            "Saldo pendiente alto",

          message:
            `${clientName} todavía debe $${formatMoney(balance)}.`,

          creditId,

          clientId,

          clientName,

          amount:
            balance,

          date:
            nextPaymentDate

        })

      );

    }

  });


  /* ====================================================
     ORDENAR ALERTAS
  ==================================================== */

  const priorityOrder = {

    high: 1,

    medium: 2,

    low: 3

  };


  return alerts.sort(

    (a, b) =>

      priorityOrder[a.priority] -
      priorityOrder[b.priority]

  );

}


/* ======================================================
   CONTADORES DE ALERTAS
====================================================== */

export function getAlertSummary(
  alerts = []
) {

  return {

    total:
      alerts.length,

    high:
      alerts.filter(
        alert =>
          alert.priority === "high"
      ).length,

    medium:
      alerts.filter(
        alert =>
          alert.priority === "medium"
      ).length,

    low:
      alerts.filter(
        alert =>
          alert.priority === "low"
      ).length

  };

}