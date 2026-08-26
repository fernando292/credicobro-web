import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  runTransaction
} from "firebase/firestore";

import { db } from "../../../../config/firebase";

import {
  createNotification
} from "../notifications/notificationService";

import {
  assignClientAutomaticallyToRoute
} from "../routes/routeService";


/* ======================================================
   REFERENCIAS
====================================================== */

function getCreditsRef(companyId) {

  return collection(
    db,
    "companies",
    companyId,
    "credits"
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


function getFinanceRef(companyId) {

  return doc(
    db,
    "companies",
    companyId,
    "settings",
    "finance"
  );

}


/* ======================================================
   OBTENER CRÉDITOS
====================================================== */

export async function getCredits(companyId) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const snapshot =
    await getDocs(
      getCreditsRef(companyId)
    );


  return snapshot.docs.map(item => ({

    firestoreId:
      item.id,

    ...item.data(),

    id:
      item.id

  }));

}


/* ======================================================
   OBTENER CRÉDITO
====================================================== */

export async function getCreditById(
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
    await getDoc(
      getCreditRef(
        companyId,
        creditId
      )
    );


  if (!snapshot.exists()) {

    return null;

  }


  return {

    firestoreId:
      snapshot.id,

    ...snapshot.data(),

    id:
      snapshot.id

  };

}


/* ======================================================
   CREAR CRÉDITO
====================================================== */

export async function createCredit(
  companyId,
  credit
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  if (!credit) {

    throw new Error(
      "La información del crédito es obligatoria."
    );

  }


  const creditAmount =
    Number(
      credit.amount || 0
    );


  if (creditAmount <= 0) {

    throw new Error(
      "El monto del crédito debe ser mayor que cero."
    );

  }


  const creditRef =
    doc(
      getCreditsRef(companyId)
    );


  const financeRef =
    getFinanceRef(companyId);


  await runTransaction(
    db,
    async transaction => {

      const financeSnapshot =
        await transaction.get(
          financeRef
        );


      const finance =
        financeSnapshot.exists()
          ? financeSnapshot.data()
          : {};


      const initialCapital =
        Number(
          finance.initialCapital || 0
        );


      if (initialCapital <= 0) {

        throw new Error(
          "No existe capital disponible para prestar. Registra primero el capital inicial en Finanzas."
        );

      }


      const capitalAvailable =
        Number(
          finance.capitalAvailable !== undefined
            ? finance.capitalAvailable
            : initialCapital
        );


      const capitalPlaced =
        Number(
          finance.capitalPlaced || 0
        );


      const interestPending =
        Number(
          finance.interestPending || 0
        );


      const interestCollected =
        Number(
          finance.interestCollected || 0
        );


      if (
        creditAmount >
        capitalAvailable
      ) {

        throw new Error(
          `Capital insuficiente. Capital disponible: $${capitalAvailable.toLocaleString(
            "es-CO"
          )}. Crédito solicitado: $${creditAmount.toLocaleString(
            "es-CO"
          )}.`
        );

      }


      const totalCredit =
        Number(
          credit.total ||
          creditAmount
        );


      const calculatedInterest =
        Math.max(
          totalCredit -
          creditAmount,
          0
        );


      const newCapitalAvailable =
        capitalAvailable -
        creditAmount;


      const newCapitalPlaced =
        capitalPlaced +
        creditAmount;


      const newInterestPending =
        interestPending +
        calculatedInterest;


      const creditData = {

        ...credit,

        amount:
          creditAmount,

        capital:
          creditAmount,

        total:
          totalCredit,

        interestAmount:
          Number(
            credit.interestAmount ||
            calculatedInterest
          ),

        balance:
          Number(
            credit.balance ||
            totalCredit
          ),

        paidAmount:
          Number(
            credit.paidAmount || 0
          ),

        paidCapital:
          Number(
            credit.paidCapital || 0
          ),

        paidInterest:
          Number(
            credit.paidInterest || 0
          ),

        paidInstallments:
          Number(
            credit.paidInstallments || 0
          ),

        pendingInstallments:
          Number(
            credit.pendingInstallments ||
            credit.installments ||
            0
          ),

        status:
          credit.status ||
          "Activo",

        createdAt:
          credit.createdAt ||
          new Date()

      };


      transaction.set(
        creditRef,
        creditData
      );


      transaction.set(
        financeRef,
        {

          initialCapital,

          capitalAvailable:
            newCapitalAvailable,

          capitalPlaced:
            newCapitalPlaced,

          interestCollected,

          interestPending:
            newInterestPending

        },
        {
          merge: true
        }
      );

    }
  );


  await createNotification({

    companyId,

    title:
      "Nuevo crédito",

    message:
      `${credit.client || "Cliente"} recibió un crédito por $${creditAmount.toLocaleString(
        "es-CO"
      )}`,

    type:
      "success",

    module:
      "credits",

    referenceId:
      creditRef.id

  });


  if (credit.clientId) {

    const paymentDate =
      credit.nextPaymentDate ||
      credit.paymentDate ||
      credit.firstPayment ||
      null;


    if (paymentDate) {

      try {

        await assignClientAutomaticallyToRoute(
          companyId,
          credit.clientId,
          paymentDate
        );

      } catch (error) {

        console.error(
          "Error asignando crédito a ruta automática:",
          error
        );

      }

    }

  }


  return {

    firestoreId:
      creditRef.id,

    ...credit,

    amount:
      creditAmount,

    id:
      creditRef.id

  };

}


/* ======================================================
   ACTUALIZAR CRÉDITO
====================================================== */

export async function updateCredit(
  companyId,
  creditId,
  data
) {

  if (
    !companyId ||
    !creditId
  ) {

    throw new Error(
      "companyId y creditId son obligatorios."
    );

  }


  const creditRef =
    getCreditRef(
      companyId,
      creditId
    );


  await updateDoc(
    creditRef,
    data
  );


  if (data.clientId) {

    const paymentDate =
      data.nextPaymentDate ||
      data.paymentDate ||
      data.firstPayment ||
      null;


    if (paymentDate) {

      try {

        await assignClientAutomaticallyToRoute(
          companyId,
          data.clientId,
          paymentDate
        );

      } catch (error) {

        console.error(
          "Error actualizando ruta automática:",
          error
        );

      }

    }

  }

}


/* ======================================================
   ELIMINAR CRÉDITO
====================================================== */

export async function removeCredit(
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


  const creditRef =
    getCreditRef(
      companyId,
      creditId
    );


  const financeRef =
    getFinanceRef(
      companyId
    );


  await runTransaction(
    db,
    async transaction => {

      const creditSnapshot =
        await transaction.get(
          creditRef
        );


      if (!creditSnapshot.exists()) {

        throw new Error(
          "Crédito no encontrado."
        );

      }


      const credit =
        creditSnapshot.data();


      const financeSnapshot =
        await transaction.get(
          financeRef
        );


      const finance =
        financeSnapshot.exists()
          ? financeSnapshot.data()
          : {};


      const creditCapital =
        Number(
          credit.capital ||
          credit.amount ||
          0
        );


      const paidCapital =
        Number(
          credit.paidCapital || 0
        );


      const remainingCapital =
        Math.max(
          creditCapital -
          paidCapital,
          0
        );


      const capitalAvailable =
        Number(
          finance.capitalAvailable || 0
        );


      const capitalPlaced =
        Number(
          finance.capitalPlaced || 0
        );


      const interestAmount =
        Number(
          credit.interestAmount || 0
        );


      const paidInterest =
        Number(
          credit.paidInterest || 0
        );


      const remainingInterest =
        Math.max(
          interestAmount -
          paidInterest,
          0
        );


      const interestPending =
        Number(
          finance.interestPending || 0
        );


      transaction.delete(
        creditRef
      );


      transaction.set(
        financeRef,
        {

          capitalAvailable:
            capitalAvailable +
            remainingCapital,

          capitalPlaced:
            Math.max(
              capitalPlaced -
              remainingCapital,
              0
            ),

          interestPending:
            Math.max(
              interestPending -
              remainingInterest,
              0
            )

        },
        {
          merge: true
        }
      );

    }
  );

}


/* ======================================================
   APLICAR PAGO AL CRÉDITO
====================================================== */

export async function applyPaymentToCredit(
  companyId,
  creditId,
  paymentValue
) {

  if (
    !companyId ||
    !creditId
  ) {

    throw new Error(
      "companyId y creditId son obligatorios."
    );

  }


  const payment =
    Number(
      paymentValue || 0
    );


  if (payment <= 0) {

    throw new Error(
      "El valor del pago debe ser mayor que cero."
    );

  }


  const creditRef =
    getCreditRef(
      companyId,
      creditId
    );


  const financeRef =
    getFinanceRef(companyId);


  await runTransaction(
    db,
    async transaction => {

      const creditSnapshot =
        await transaction.get(
          creditRef
        );


      if (!creditSnapshot.exists()) {

        throw new Error(
          "Crédito no encontrado."
        );

      }


      const credit =
        creditSnapshot.data();


      const financeSnapshot =
        await transaction.get(
          financeRef
        );


      const finance =
        financeSnapshot.exists()
          ? financeSnapshot.data()
          : {};


      const creditCapital =
        Number(
          credit.capital ||
          credit.amount ||
          0
        );


      const totalCredit =
        Number(
          credit.total ||
          credit.balance ||
          creditCapital
        );


      const currentBalance =
        Number(
          credit.balance ??
          totalCredit
        );


      const currentPaidCapital =
        Number(
          credit.paidCapital || 0
        );


      const currentPaidInterest =
        Number(
          credit.paidInterest || 0
        );


      const interestAmount =
        Number(
          credit.interestAmount ||
          Math.max(
            totalCredit -
            creditCapital,
            0
          )
        );


      const remainingCapital =
        Math.max(
          creditCapital -
          currentPaidCapital,
          0
        );


      const remainingInterest =
        Math.max(
          interestAmount -
          currentPaidInterest,
          0
        );


      const interestPaid =
        Math.min(
          payment,
          remainingInterest
        );


      const capitalPaid =
        Math.min(
          payment -
          interestPaid,
          remainingCapital
        );


      const newPaidInterest =
        currentPaidInterest +
        interestPaid;


      const newPaidCapital =
        currentPaidCapital +
        capitalPaid;


      const newPaidAmount =
        Number(
          credit.paidAmount || 0
        ) +
        payment;


      const newBalance =
        Math.max(
          currentBalance -
          payment,
          0
        );


      const currentCapitalAvailable =
        Number(
          finance.capitalAvailable || 0
        );


      const currentCapitalPlaced =
        Number(
          finance.capitalPlaced || 0
        );


      const currentInterestCollected =
        Number(
          finance.interestCollected || 0
        );


      const currentInterestPending =
        Number(
          finance.interestPending || 0
        );


      const newCapitalAvailable =
        currentCapitalAvailable +
        capitalPaid;


      const newCapitalPlaced =
        Math.max(
          currentCapitalPlaced -
          capitalPaid,
          0
        );


      const newInterestCollected =
        currentInterestCollected +
        interestPaid;


      const newInterestPending =
        Math.max(
          currentInterestPending -
          interestPaid,
          0
        );


      transaction.update(
        creditRef,
        {

          balance:
            newBalance,

          paidAmount:
            newPaidAmount,

          paidCapital:
            newPaidCapital,

          paidInterest:
            newPaidInterest,

          status:
            newBalance === 0
              ? "Pagado"
              : "Activo"

        }
      );


      transaction.set(
        financeRef,
        {

          capitalAvailable:
            newCapitalAvailable,

          capitalPlaced:
            newCapitalPlaced,

          interestCollected:
            newInterestCollected,

          interestPending:
            newInterestPending

        },
        {
          merge: true
        }
      );

    }
  );


  return await getCreditById(
    companyId,
    creditId
  );

}


/* ======================================================
   RECALCULAR CRÉDITO DESDE PAGOS
====================================================== */

export async function recalculateCreditFromPayments(
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


  const creditRef =
    getCreditRef(
      companyId,
      creditId
    );


  const paymentsRef =
    collection(
      db,
      "companies",
      companyId,
      "credits",
      creditId,
      "payments"
    );


  const financeRef =
    getFinanceRef(
      companyId
    );


  /*
   * --------------------------------------------------
   * OBTENER CRÉDITO
   * --------------------------------------------------
   */

  const creditSnapshot =
    await getDoc(
      creditRef
    );


  if (!creditSnapshot.exists()) {

    throw new Error(
      "Crédito no encontrado."
    );

  }


  const credit =
    creditSnapshot.data();


  /*
   * --------------------------------------------------
   * OBTENER PAGOS RESTANTES
   * --------------------------------------------------
   */

  const paymentsSnapshot =
    await getDocs(
      paymentsRef
    );


  const payments =
    paymentsSnapshot.docs.map(
      item => ({
        id:
          item.id,

        ...item.data()
      })
    );


  /*
   * --------------------------------------------------
   * RECALCULAR ACUMULADOS
   * --------------------------------------------------
   */

  let paidCapital = 0;

  let paidInterest = 0;

  let paidAmount = 0;


  payments.forEach(payment => {

    paidCapital +=
      Number(
        payment.capitalPaid || 0
      );


    paidInterest +=
      Number(
        payment.interestPaid || 0
      );


    paidAmount +=
      Number(
        payment.value || 0
      );

  });


  /*
   * --------------------------------------------------
   * VALORES ORIGINALES DEL CRÉDITO
   * --------------------------------------------------
   */

  const totalCredit =
    Number(
      credit.total ||
      credit.amount ||
      0
    );


  const creditCapital =
    Number(
      credit.capital ||
      credit.amount ||
      0
    );


  const interestAmount =
    Number(
      credit.interestAmount ??
      Math.max(
        totalCredit -
        creditCapital,
        0
      )
    );


  /*
   * --------------------------------------------------
   * SALDOS
   * --------------------------------------------------
   */

  const balance =
    Math.max(
      totalCredit -
      paidAmount,
      0
    );


  const status =
    balance === 0
      ? "Pagado"
      : "Activo";


  /*
   * --------------------------------------------------
   * CUOTAS
   *
   * SE MANTIENE LA LÓGICA ACTUAL:
   * SOLO CUOTAS COMPLETAS.
   * --------------------------------------------------
   */

  const installmentValue =
    Number(
      credit.installmentValue || 0
    );


  const totalInstallments =
    Number(
      credit.installments || 0
    );


  let paidInstallments = 0;


  if (
    installmentValue > 0
  ) {

    paidInstallments =
      Math.floor(
        paidAmount /
        installmentValue
      );

  }


  paidInstallments =
    Math.min(
      paidInstallments,
      totalInstallments
    );


  const pendingInstallments =
    Math.max(
      totalInstallments -
      paidInstallments,
      0
    );


  /*
   * --------------------------------------------------
   * RECONSTRUIR FINANZAS
   *
   * El crédito original tenía:
   *
   * capitalPlaced = capital pendiente
   * interestPending = interés pendiente
   *
   * Los pagos restantes determinan cuánto ya
   * regresó a capital y cuánto interés se cobró.
   * --------------------------------------------------
   */

  await runTransaction(
    db,
    async transaction => {

      const financeSnapshot =
        await transaction.get(
          financeRef
        );


      const finance =
        financeSnapshot.exists()
          ? financeSnapshot.data()
          : {};


      const initialCapital =
        Number(
          finance.initialCapital || 0
        );


      /*
       * Capital pendiente de este crédito.
       */

      const remainingCapital =
        Math.max(
          creditCapital -
          paidCapital,
          0
        );


      /*
       * Interés pendiente de este crédito.
       */

      const remainingInterest =
        Math.max(
          interestAmount -
          paidInterest,
          0
        );


      /*
       * Reconstruimos Finanzas globales
       * sin afectar el capital inicial.
       *
       * Para este crédito:
       *
       * capitalPlaced representa el capital
       * que todavía está colocado en este crédito.
       *
       * capitalAvailable representa el capital
       * que ya regresó.
       *
       * Por eso tomamos el estado actual y
       * revertimos la diferencia provocada
       * por los pagos eliminados.
       */

      const currentCapitalAvailable =
        Number(
          finance.capitalAvailable || 0
        );


      const currentCapitalPlaced =
        Number(
          finance.capitalPlaced || 0
        );


      const currentInterestCollected =
        Number(
          finance.interestCollected || 0
        );


      const currentInterestPending =
        Number(
          finance.interestPending || 0
        );


      const previousPaidCapital =
        Number(
          credit.paidCapital || 0
        );


      const previousPaidInterest =
        Number(
          credit.paidInterest || 0
        );


      const capitalDifference =
        previousPaidCapital -
        paidCapital;


      const interestDifference =
        previousPaidInterest -
        paidInterest;


      const newCapitalAvailable =
        Math.max(
          currentCapitalAvailable -
          capitalDifference,
          0
        );


      const newCapitalPlaced =
        Math.max(
          currentCapitalPlaced +
          capitalDifference,
          0
        );


      const newInterestCollected =
        Math.max(
          currentInterestCollected -
          interestDifference,
          0
        );


      const newInterestPending =
        Math.max(
          currentInterestPending +
          interestDifference,
          0
        );


      transaction.update(
        creditRef,
        {

          paidCapital,

          paidInterest,

          paidAmount,

          balance,

          status,

          paidInstallments,

          pendingInstallments

        }
      );


      transaction.set(
        financeRef,
        {

          initialCapital,

          capitalAvailable:
            newCapitalAvailable,

          capitalPlaced:
            newCapitalPlaced,

          interestCollected:
            newInterestCollected,

          interestPending:
            newInterestPending

        },
        {
          merge: true
        }
      );

    }
  );


  return await getCreditById(
    companyId,
    creditId
  );

}