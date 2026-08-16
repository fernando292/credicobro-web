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
  createNotification
} from "../notifications/notificationService";

import {
  applyPaymentToCredit
} from "../credit/creditService";


/* ======================================================
   REFERENCIA DE PAGOS
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


/* ======================================================
   REFERENCIA DE CRÉDITO
====================================================== */

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


  if (
    paymentValue <= 0
  ) {

    throw new Error(
      "El valor del pago debe ser mayor que cero."
    );

  }


  console.log(
    "CREATE PAYMENT EJECUTADO",
    {
      companyId,
      creditId,
      amount:
        paymentValue
    }
  );


  /* ====================================================
     1. LEER ESTADO ANTERIOR DEL CRÉDITO
  ==================================================== */

  const creditSnapshot =
    await getDoc(
      getCreditRef(
        companyId,
        creditId
      )
    );


  if (
    !creditSnapshot.exists()
  ) {

    throw new Error(
      "El crédito no existe."
    );

  }


  const previousCredit =
    creditSnapshot.data();


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


  /* ====================================================
     2. APLICAR PAGO AL CRÉDITO

     applyPaymentToCredit actualiza:

     - capitalAvailable
     - capitalPlaced
     - interestCollected
     - interestPending
     - balance
     - paidAmount
     - paidCapital
     - paidInterest
  ==================================================== */

  const updatedCredit =
    await applyPaymentToCredit(
      companyId,
      creditId,
      paymentValue
    );


  console.log(
    "PAGO APLICADO AL CRÉDITO",
    {
      creditId,

      payment:
        paymentValue,

      paidCapitalTotal:
        updatedCredit.paidCapital || 0,

      paidInterestTotal:
        updatedCredit.paidInterest || 0,

      balance:
        updatedCredit.balance || 0
    }
  );


  /* ====================================================
     3. CALCULAR LOS VALORES DE ESTE PAGO

     El crédito guarda acumulados.

     Ejemplo:

     Antes:
     paidCapital   = 80.000
     paidInterest  = 0

     Después:
     paidCapital   = 160.000
     paidInterest  = 0

     Este pago:
     capitalPaid   = 80.000
     interestPaid  = 0
  ==================================================== */

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


  const calculatedPayment =
    capitalPaid +
    interestPaid;


  /*
    Validación de seguridad.

    El pago debe quedar completamente
    distribuido entre capital e interés.

    Permitimos una pequeña diferencia
    únicamente por posibles redondeos.
  */

  const difference =
    Math.abs(

      calculatedPayment -
      paymentValue

    );


  if (
    difference > 0.01
  ) {

    console.warn(

      "ADVERTENCIA: el pago no coincide con la distribución financiera.",

      {

        paymentValue,

        capitalPaid,

        interestPaid,

        calculatedPayment,

        difference

      }

    );

  }


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


  /* ====================================================
     4. PREPARAR DOCUMENTO DEL PAGO

     IMPORTANTE:

     capitalPaid e interestPaid corresponden
     ÚNICAMENTE a este pago.

     NO son los acumulados del crédito.
  ==================================================== */

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

    createdAt:
      payment.createdAt ||
      new Date()

  };


  /* ====================================================
     5. GUARDAR PAGO
  ==================================================== */

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


  /* ====================================================
     6. NOTIFICACIÓN
  ==================================================== */

  try {

    await createNotification({

      companyId,

      title:
        "Pago registrado",

      message:
        `${payment.client || "Cliente"} realizó un pago por $${paymentValue.toLocaleString(
          "es-CO"
        )}`,

      type:
        "success",

      module:
        "payments",

      referenceId:
        result.id

    });

  } catch (error) {

    /*
      La notificación no debe
      invalidar un pago que ya
      fue registrado correctamente.
    */

    console.error(
      "Error creando notificación del pago:",
      error
    );

  }


  /* ====================================================
     7. DEVOLVER PAGO
  ==================================================== */

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

}