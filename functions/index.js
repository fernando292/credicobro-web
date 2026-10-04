const { setGlobalOptions } = require("firebase-functions");
const { onSchedule } = require("firebase-functions/v2/scheduler");

const { initializeApp } = require("firebase-admin/app");
const {
  getFirestore,
  FieldValue
} = require("firebase-admin/firestore");

setGlobalOptions({
  maxInstances: 10
});

initializeApp();

const db = getFirestore();

const TIME_ZONE = "America/Bogota";

function getDateKey(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {
    value = value.toDate();
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.split("T")[0];
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

exports.sendTodayCollectionSms = onSchedule(
  {
    schedule: "0 7 * * *",
    timeZone: TIME_ZONE
  },
  async () => {
    const today = getTodayKey();

    console.log(
      `Iniciando revisión de cobros de hoy: ${today}`
    );

    const companiesSnapshot =
      await db.collection("companies").get();

    let companiesProcessed = 0;
    let creditsProcessed = 0;
    let smsQueued = 0;

    for (const companyDoc of companiesSnapshot.docs) {
      const companyId = companyDoc.id;

      companiesProcessed++;

      const creditsSnapshot =
        await db
          .collection("companies")
          .doc(companyId)
          .collection("credits")
          .get();

      for (const creditDoc of creditsSnapshot.docs) {
        const credit = creditDoc.data();

        creditsProcessed++;

        if (credit.status !== "Activo") {
          continue;
        }

        if (Number(credit.balance || 0) <= 0) {
          continue;
        }

        const nextPaymentDate =
          credit.nextPaymentDate ||
          credit.firstPayment ||
          null;

        if (
          getDateKey(nextPaymentDate) !== today
        ) {
          continue;
        }

        if (credit.smsEnabled !== true) {
          continue;
        }

        const clientId = credit.clientId;

        if (!clientId) {
          console.log(
            "Crédito sin clientId:",
            creditDoc.id
          );
          continue;
        }

        const clientSnapshot =
          await db
            .collection("companies")
            .doc(companyId)
            .collection("clients")
            .doc(String(clientId))
            .get();

        if (!clientSnapshot.exists) {
          console.log(
            "Cliente no encontrado:",
            clientId
          );
          continue;
        }

        const client = clientSnapshot.data();

        if (client.smsEnabled !== true) {
          continue;
        }

        if (!client.phone) {
          console.log(
            "Cliente sin teléfono:",
            clientId
          );
          continue;
        }

        const smsId =
          `today_${creditDoc.id}_${today}`;

        const smsRef =
          db
            .collection("companies")
            .doc(companyId)
            .collection("smsQueue")
            .doc(smsId);

        const existingSms =
          await smsRef.get();

        if (existingSms.exists) {
          console.log(
            "SMS de cobro ya procesado:",
            smsId
          );
          continue;
        }

        const clientName =
          client.name ||
          credit.client ||
          "Cliente";

        const amount =
          formatMoney(
            credit.installmentValue || 0
          );

        const message =
          `Hoy corresponde cobrar a ${clientName}. Valor: ${amount}`;

        await smsRef.set({
          phone: client.phone,
          message,
          status: "pending",
          type: "payment_due",
          referenceId: creditDoc.id,
          createdAt: FieldValue.serverTimestamp()
        });

        smsQueued++;

        console.log(
          "SMS de cobro agregado a smsQueue:",
          {
            companyId,
            creditId: creditDoc.id,
            clientId,
            phone: client.phone,
            smsId
          }
        );
      }
    }

    console.log(
      "Revisión de cobros finalizada:",
      {
        today,
        companiesProcessed,
        creditsProcessed,
        smsQueued
      }
    );
  }
);