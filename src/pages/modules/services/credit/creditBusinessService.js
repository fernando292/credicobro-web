import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../../../../config/firebase";

import {
  createPayment,
  removePayment
} from "../payment/paymentService";

import {
  assignClientAutomaticallyToRoute
} from "../routes/routeService";


/* ======================================================
   HELPERS
====================================================== */

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


function calculateInstallments(
  paidAmount,
  installmentValue,
  totalInstallments
) {

  const paid =
    Number(paidAmount || 0);

  const installment =
    Number(installmentValue || 0);

  const total =
    Number(totalInstallments || 0);


  if (
    installment <= 0 ||
    total <= 0
  ) {

    return 0;

  }


  const completed =
    Math.floor(
      paid / installment
    );


  return Math.min(
    completed,
    total
  );

}


/* ======================================================
   SIGUIENTE FECHA DE PAGO
====================================================== */

function calculateNextPaymentDate(
  credit
) {

  if (
    !credit?.nextPaymentDate &&
    !credit?.firstPayment
  ) {

    return null;

  }


  const baseDate =
    credit.nextPaymentDate ||
    credit.firstPayment;


  const dateString =
    String(baseDate)
      .split("T")[0];


  const currentDate =
    new Date(
      `${dateString}T00:00:00`
    );


  if (
    Number.isNaN(
      currentDate.getTime()
    )
  ) {

    return null;

  }


  switch (credit.frequency) {

    case "Semanal":

      currentDate.setDate(
        currentDate.getDate() + 7
      );

      break;


    case "Quincenal":

      currentDate.setDate(
        currentDate.getDate() + 15
      );

      break;


    case "Mensual":

      currentDate.setMonth(
        currentDate.getMonth() + 1
      );

      break;


    default:

      return null;

  }


  return currentDate
    .toISOString()
    .split("T")[0];

}


/* ======================================================
   RESOLVER CRÉDITO
====================================================== */

export async function resolveCredit(
  companyId,
  creditId,
  clientId
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  const normalizedCreditId =
    normalizeId(creditId);


  const normalizedClientId =
    normalizeId(clientId);


  /*
   * --------------------------------------------------
   * INTENTAR DIRECTAMENTE POR FIRESTORE ID
   * --------------------------------------------------
   */

  if (normalizedCreditId) {

    const creditRef =
      doc(
        db,
        "companies",
        companyId,
        "credits",
        normalizedCreditId
      );


    const snapshot =
      await getDoc(
        creditRef
      );


    if (snapshot.exists()) {

      const credit =
        snapshot.data();


      if (
        normalizedClientId &&
        normalizeId(
          credit.clientId
        ) !== normalizedClientId
      ) {

        console.warn(
          "El crédito indicado no pertenece al cliente de la visita.",
          {

            creditId:
              normalizedCreditId,

            creditClientId:
              credit.clientId,

            clientId:
              normalizedClientId

          }
        );

      } else {

        return {

          ...credit,

          id:
            snapshot.id,

          firestoreId:
            snapshot.id

        };

      }

    }

  }


  /*
   * --------------------------------------------------
   * BÚSQUEDA ALTERNATIVA
   * --------------------------------------------------
   */

  if (
    normalizedClientId ||
    normalizedCreditId
  ) {

    const creditsRef =
      collection(
        db,
        "companies",
        companyId,
        "credits"
      );


    const creditsSnapshot =
      await getDocs(
        creditsRef
      );


    const clientCredits =
      creditsSnapshot.docs
        .map(item => {

          const data =
            item.data();


          return {

            ...data,

            legacyCreditId:
              normalizeId(
                data.id
              ),

            id:
              item.id,

            firestoreId:
              item.id

          };

        })
        .filter(credit => {

          if (!normalizedClientId) {

            return true;

          }


          return (
            normalizeId(
              credit.clientId
            ) ===
            normalizedClientId
          );

        });


    /*
     * Buscar por ID lógico/antiguo
     */

    if (normalizedCreditId) {

      const matchingCredit =
        clientCredits.find(
          credit => (

            normalizeId(
              credit.creditId
            ) === normalizedCreditId ||

            normalizeId(
              credit.legacyCreditId
            ) === normalizedCreditId

          )
        );


      return matchingCredit || null;

    }


    /*
     * Buscar crédito activo único
     */

    const activeCredits =
      clientCredits.filter(
        credit =>
          String(
            credit.status || ""
          ).trim() !== "Pagado"
      );


    if (
      activeCredits.length === 1
    ) {

      return activeCredits[0];

    }


    /*
     * Buscar crédito con saldo
     */

    const creditsWithBalance =
      activeCredits.filter(
        credit =>
          Number(
            credit.balance || 0
          ) > 0
      );


    if (
      creditsWithBalance.length === 1
    ) {

      return creditsWithBalance[0];

    }


    /*
     * Si solamente existe uno
     */

    if (
      clientCredits.length === 1
    ) {

      return clientCredits[0];

    }

  }


  return null;

}


/* ======================================================
   REGISTRAR PAGO
====================================================== */

export async function registerCreditPayment(
  companyId,
  creditId,
  payment
) {

  if (
    !companyId ||
    typeof companyId !== "string"
  ) {

    throw new Error(
      "companyId no es válido."
    );

  }


  if (!payment) {

    throw new Error(
      "La información del pago es obligatoria."
    );

  }


  /*
   * Si no llega creditId,
   * debe existir clientId para resolverlo.
   */

  if (
    !creditId ||
    typeof creditId !== "string"
  ) {

    if (
      !normalizeId(
        payment.clientId
      )
    ) {

      throw new Error(
        "El ID del crédito no es válido."
      );

    }

  }


  /*
   * Resolver crédito real
   */

  const credit =
    await resolveCredit(
      companyId,
      creditId,
      payment.clientId
    );


  if (!credit) {

    throw new Error(
      "Crédito no encontrado."
    );

  }


  const realCreditId =
    normalizeId(
      credit.id
    );


  if (!realCreditId) {

    throw new Error(
      "El crédito encontrado no tiene un ID válido."
    );

  }


  /*
   * Obtener pagos existentes
   */

  const paymentsRef =
    collection(
      db,
      "companies",
      companyId,
      "credits",
      realCreditId,
      "payments"
    );


  const paymentsSnapshot =
    await getDocs(
      paymentsRef
    );


  const usedInstallments =
    paymentsSnapshot.docs.map(
      item =>
        Number(
          item.data().installmentNumber || 0
        )
    );


  const nextInstallment =
    Math.max(
      ...usedInstallments,
      0
    ) + 1;


  /*
   * Valor del pago
   */

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
   * Preparar pago
   */

  const paymentWithInstallment = {

    ...payment,

    value:
      paymentValue,

    installmentNumber:
      nextInstallment,

    creditId:
      realCreditId,

    companyId

  };


  /*
   * Guardar pago.
   *
   * createPayment() es quien realiza
   * la actualización financiera.
   */

  const savedPayment =
    await createPayment(
      companyId,
      realCreditId,
      paymentWithInstallment
    );


  /*
   * Obtener crédito actualizado
   */

  const creditRef =
    doc(
      db,
      "companies",
      companyId,
      "credits",
      realCreditId
    );


  const updatedCreditSnapshot =
    await getDoc(
      creditRef
    );


  if (
    !updatedCreditSnapshot.exists()
  ) {

    throw new Error(
      "El crédito no existe después de registrar el pago."
    );

  }


  const updatedCreditData =
    updatedCreditSnapshot.data();


  /*
   * --------------------------------------------------
   * CUOTAS
   *
   * SE MANTIENE LA LÓGICA ACTUAL:
   * SOLO CUOTAS COMPLETAS.
   *
   * La lógica de pagos parciales se implementará
   * posteriormente.
   * --------------------------------------------------
   */

  const currentPaidAmount =
    Number(
      updatedCreditData.paidAmount || 0
    );


  const totalInstallments =
    Number(
      updatedCreditData.installments || 0
    );


  const installmentValue =
    Number(
      updatedCreditData.installmentValue || 0
    );


  const paidInstallments =
    calculateInstallments(
      currentPaidAmount,
      installmentValue,
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
   * SIGUIENTE FECHA
   * --------------------------------------------------
   */

  let nextPaymentDate =
    updatedCreditData.nextPaymentDate ||
    null;


  if (
    pendingInstallments > 0
  ) {

    nextPaymentDate =
      calculateNextPaymentDate({

        ...updatedCreditData,

        nextPaymentDate

      });

  } else {

    nextPaymentDate =
      null;

  }


  const installmentData = {

    paidInstallments,

    pendingInstallments,

    nextPaymentDate

  };


  /*
   * Actualizar solamente datos de cuotas.
   */

  await updateDoc(
    creditRef,
    installmentData
  );


  /*
   * --------------------------------------------------
   * ACTUALIZAR RUTA
   * --------------------------------------------------
   */

  let updatedRoute =
    null;


  if (
    pendingInstallments > 0 &&
    nextPaymentDate &&
    updatedCreditData.clientId
  ) {

    try {

      updatedRoute =
        await assignClientAutomaticallyToRoute(
          companyId,
          updatedCreditData.clientId,
          nextPaymentDate,
          realCreditId
        );

    } catch (error) {

      console.error(
        "Error preparando la siguiente ruta automática:",
        error
      );

    }

  }


  /*
   * Obtener crédito final actualizado
   */

  const finalCreditSnapshot =
    await getDoc(
      creditRef
    );


  const finalCredit =
    finalCreditSnapshot.exists()
      ? finalCreditSnapshot.data()
      : {

          ...updatedCreditData,

          ...installmentData

        };


  return {

    payment:
      savedPayment,

    updatedCredit: {

      ...finalCredit,

      id:
        realCreditId,

      firestoreId:
        realCreditId

    },

    updatedRoute

  };

}


/* ======================================================
   ELIMINAR PAGO
====================================================== */

export async function deleteCreditPayment(
  companyId,
  creditId,
  paymentId
) {

  /*
   * Resolver crédito primero para soportar
   * IDs antiguos/lógicos.
   */

  const resolvedCredit =
    await resolveCredit(
      companyId,
      creditId
    );


  if (!resolvedCredit) {

    throw new Error(
      "Crédito no encontrado."
    );

  }


  const realCreditId =
    normalizeId(
      resolvedCredit.id
    );


  if (!realCreditId) {

    throw new Error(
      "El crédito no tiene un ID válido."
    );

  }


  /*
   * Eliminar pago.
   *
   * removePayment() también recalcula
   * los acumulados financieros.
   */

  await removePayment(
    companyId,
    realCreditId,
    paymentId
  );


  /*
   * Obtener crédito actualizado.
   */

  const creditRef =
    doc(
      db,
      "companies",
      companyId,
      "credits",
      realCreditId
    );


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
   * Obtener pagos restantes.
   */

  const paymentsRef =
    collection(
      db,
      "companies",
      companyId,
      "credits",
      realCreditId,
      "payments"
    );


  const paymentsSnapshot =
    await getDocs(
      paymentsRef
    );


  const payments =
    paymentsSnapshot.docs.map(
      item =>
        item.data()
    );


  /*
   * Calcular total pagado.
   */

  const paidAmount =
    payments.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.value || 0
        ),
      0
    );


  /*
   * Mantener lógica actual:
   * solamente cuotas completas.
   */

  const paidInstallments =
    calculateInstallments(
      paidAmount,
      Number(
        credit.installmentValue || 0
      ),
      Number(
        credit.installments || 0
      )
    );


  const pendingInstallments =
    Math.max(
      Number(
        credit.installments || 0
      ) -
      paidInstallments,
      0
    );


  /*
   * Actualizar cuotas.
   */

  await updateDoc(
    creditRef,
    {

      paidInstallments,

      pendingInstallments

    }
  );


  /*
   * Obtener crédito final.
   */

  const finalCreditSnapshot =
    await getDoc(
      creditRef
    );


  const finalCredit =
    finalCreditSnapshot.exists()
      ? finalCreditSnapshot.data()
      : {

          ...credit,

          paidInstallments,

          pendingInstallments

        };


  return {

    updatedCredit: {

      ...finalCredit,

      id:
        realCreditId,

      firestoreId:
        realCreditId

    }

  };

}