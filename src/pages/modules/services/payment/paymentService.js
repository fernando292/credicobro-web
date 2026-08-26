import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "../../../../config/firebase";

import {
  notifyPaymentRegistered
} from "../notifications/notificationEngine";

import {
  applyPaymentToCredit,
  recalculateCreditFromPayments
} from "../credit/creditService";


/* ======================================================
   REFERENCIAS
====================================================== */

function getPaymentsRef(
  companyId,
  creditId
) {

  return collection(
    db,
    "companies",
    companyId,
    "credits",
    creditId,
    "payments"
  );

}


function getCreditRef(
  companyId,
  creditId
) {

  return doc(
    db,
    "companies",
    companyId,
    "credits",
    creditId
  );

}


function getClientRef(
  companyId,
  clientId
) {

  return doc(
    db,
    "companies",
    companyId,
    "clients",
    clientId
  );

}


/* ======================================================
   OBTENER PAGOS
====================================================== */

export async function getPayments(
  companyId,
  creditId
) {

  if (
    !companyId ||
    !creditId
  ) {

    throw new Error(
      "companyId y creditId son obligatorios."
    );

  }


  const snapshot =
    await getDocs(
      getPaymentsRef(
        companyId,
        creditId
      )
    );


  return snapshot.docs.map(
    item => ({

      id:
        item.id,

      ...item.data()

    })
  );

}


/* ======================================================
   CREAR PAGO
====================================================== */

export async function createPayment(
  companyId,
  creditId,
  payment
) {

  if (
    !companyId ||
    !creditId
  ) {

    throw new Error(
      "companyId y creditId son obligatorios."
    );

  }


  if (!payment) {

    throw new Error(
      "La información del pago es obligatoria."
    );

  }


  const paymentValue =
    Number(
      payment.value || 0
    );


  if (paymentValue <= 0) {

    throw new Error(
      "El valor del pago debe ser mayor que cero."
    );

  }


  /*
   * ESTADO ANTERIOR DEL CRÉDITO.
   */

  const creditSnapshot =
    await getDoc(
      getCreditRef(
        companyId,
        creditId
      )
    );


  if (!creditSnapshot.exists()) {

    throw new Error(
      "El crédito no existe."
    );

  }


  const previousCredit =
    creditSnapshot.data();


  /*
   * CLIENTE REAL DEL CRÉDITO.
   */

  const clientId =
    payment.clientId ||
    previousCredit.clientId ||
    "";


  let clientData =
    null;


  if (clientId) {

    const clientSnapshot =
      await getDoc(
        getClientRef(
          companyId,
          clientId
        )
      );


    if (clientSnapshot.exists()) {

      clientData = {

        id:
          clientSnapshot.id,

        ...clientSnapshot.data()

      };

    }

  }


  /*
   * DATOS REALES DEL CLIENTE.
   */

  const clientName =
    clientData?.name ||
    clientData?.fullName ||
    clientData?.nombre ||
    payment.client ||
    previousCredit.client ||
    "Cliente";


  const clientPhone =
    clientData?.phone ||
    clientData?.phoneNumber ||
    clientData?.telefono ||
    payment.phone ||
    null;


  const clientDocument =
    clientData?.document ||
    clientData?.documentNumber ||
    clientData?.identification ||
    clientData?.cedula ||
    null;


  /*
   * LOG PRINCIPAL DEL PAGO.
   */

  console.log(
    "CREATE PAYMENT EJECUTADO",
    {

      companyId,

      creditId,

      amount:
        paymentValue,

      client: {

        id:
          clientData?.id ||
          clientId ||
          null,

        name:
          clientName,

        phone:
          clientPhone,

        document:
          clientDocument

      }

    }
  );


  /*
   * ACUMULADOS ANTERIORES.
   */

  const previousPaidCapital =
    Number(
      previousCredit.paidCapital || 0
    );


  const previousPaidInterest =
    Number(
      previousCredit.paidInterest || 0
    );


  const previousPaidAmount =
    Number(
      previousCredit.paidAmount || 0
    );


  /*
   * ÚNICA ACTUALIZACIÓN FINANCIERA.
   */

  const updatedCredit =
    await applyPaymentToCredit(
      companyId,
      creditId,
      paymentValue
    );


  if (!updatedCredit) {

    throw new Error(
      "No se pudo actualizar el crédito."
    );

  }


  /*
   * ACUMULADOS ACTUALIZADOS.
   */

  const currentPaidCapital =
    Number(
      updatedCredit.paidCapital || 0
    );


  const currentPaidInterest =
    Number(
      updatedCredit.paidInterest || 0
    );


  const currentPaidAmount =
    Number(
      updatedCredit.paidAmount || 0
    );


  /*
   * DISTRIBUCIÓN DE ESTE PAGO.
   */

  const capitalPaid =
    Math.max(
      currentPaidCapital -
      previousPaidCapital,
      0
    );


  const interestPaid =
    Math.max(
      currentPaidInterest -
      previousPaidInterest,
      0
    );


  console.log(
    "DISTRIBUCIÓN DEL PAGO",
    {

      paymentValue,

      capitalPaid,

      interestPaid,

      previousPaidCapital,

      currentPaidCapital,

      previousPaidInterest,

      currentPaidInterest

    }
  );


  const calculatedPayment =
    capitalPaid +
    interestPaid;


  const difference =
    Math.abs(
      calculatedPayment -
      paymentValue
    );


  if (difference > 0.01) {

    console.warn(
      "ADVERTENCIA: distribución financiera diferente al pago.",
      {

        paymentValue,

        capitalPaid,

        interestPaid,

        calculatedPayment,

        difference

      }
    );

  }


  /*
   * DOCUMENTO DEL PAGO.
   */

  const paymentData = {

    ...payment,

    value:
      paymentValue,

    capitalPaid,

    interestPaid,

    paidAmount:
      paymentValue,

    creditId,

    companyId,

    clientId:
      clientId ||
      null,

    createdAt:
      payment.createdAt ||
      new Date()

  };


  /*
   * GUARDAR PAGO.
   */

  const result =
    await addDoc(
      getPaymentsRef(
        companyId,
        creditId
      ),
      paymentData
    );


  console.log(
    "PAGO GUARDADO CORRECTAMENTE",
    {

      paymentId:
        result.id,

      creditId,

      amount:
        paymentValue,

      capitalPaid,

      interestPaid

    }
  );


  /*
   * NOTIFICACIÓN DEL PAGO.
   *
   * Si el cliente tiene teléfono:
   *
   * internal
   * +
   * whatsapp
   *
   * Si no tiene teléfono:
   *
   * internal
   *
   * El teléfono se envía explícitamente
   * al motor de notificaciones.
   */

  try {

    await notifyPaymentRegistered({

      companyId,

      client:
        clientName,

      amount:
        paymentValue,

      phone:
        clientPhone,

      communicationPreferences: {

        whatsappEnabled:

          clientData?.whatsappEnabled === true,

        smsEnabled:

          clientData?.smsEnabled === true,

        emailEnabled:

          clientData?.emailEnabled === true

      },

      referenceId:
        result.id

    });

  } catch (error) {

    console.error(
      "Error creando notificación del pago:",
      error
    );

  }


  return {

    id:
      result.id,

    ...paymentData,

    capitalPaid,

    interestPaid,

    previousPaidAmount,

    currentPaidAmount,

    credit:
      updatedCredit

  };

}


/* ======================================================
   ACTUALIZAR PAGO
====================================================== */

export async function updatePayment(
  companyId,
  creditId,
  paymentId,
  data
) {

  if (
    !companyId ||
    !creditId ||
    !paymentId
  ) {

    throw new Error(
      "companyId, creditId y paymentId son obligatorios."
    );

  }


  if (!data) {

    throw new Error(
      "La información del pago es obligatoria."
    );

  }


  const paymentRef =
    doc(
      db,
      "companies",
      companyId,
      "credits",
      creditId,
      "payments",
      paymentId
    );


  await updateDoc(
    paymentRef,
    data
  );

}


/* ======================================================
   ELIMINAR PAGO
====================================================== */

export async function removePayment(
  companyId,
  creditId,
  paymentId
) {

  if (
    !companyId ||
    !creditId ||
    !paymentId
  ) {

    throw new Error(
      "companyId, creditId y paymentId son obligatorios."
    );

  }


  const paymentRef =
    doc(
      db,
      "companies",
      companyId,
      "credits",
      creditId,
      "payments",
      paymentId
    );


  await deleteDoc(
    paymentRef
  );


  return await recalculateCreditFromPayments(
    companyId,
    creditId
  );

}