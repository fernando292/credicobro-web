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


function normalizeDate(value) {

  if (!value) {
    return "";
  }

  return String(value)
    .trim()
    .split("T")[0];

}


function calculateInstallments(
  paidAmount,
  installmentValue,
  totalInstallments
) {

  if (
    !installmentValue ||
    installmentValue <= 0
  ) {

    return 0;

  }

  const paid =
    Math.floor(
      paidAmount /
      installmentValue
    );

  return Math.min(
    paid,
    Number(
      totalInstallments || 0
    )
  );

}


/* ======================================================
   CALCULAR SIGUIENTE FECHA
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

  const currentDate =
    new Date(
      `${String(baseDate).split("T")[0]}T00:00:00`
    );

  if (
    Number.isNaN(
      currentDate.getTime()
    )
  ) {

    return null;

  }

  switch (
    credit.frequency
  ) {

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
   BUSCAR CRÃ‰DITO REAL
====================================================== */

export async function resolveCredit(
  companyId,
  creditId,
  clientId
) {

  const normalizedCreditId =
    normalizeId(
      creditId
    );

  const normalizedClientId =
    normalizeId(
      clientId
    );


  /* ====================================================
     PRIMERO: INTENTAR POR ID
  ==================================================== */

  if (
    normalizedCreditId
  ) {

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


    if (
      snapshot.exists()
    ) {

      const credit =
        snapshot.data();


      /*
       * Si tenemos clientId,
       * verificamos que el crÃ©dito pertenezca
       * al cliente correcto.
       */

      if (
        normalizedClientId &&
        normalizeId(
          credit.clientId
        ) !==
        normalizedClientId
      ) {

        console.warn(
          "El crÃ©dito indicado no pertenece al cliente de la visita.",
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


  /* ====================================================
     SEGUNDO: BUSCAR POR CLIENTE
  ==================================================== */

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
        .map(
          item => ({

            ...item.data(),

            legacyCreditId:
              normalizeId(
                item.data().id
              ),

            id:
              item.id,

            firestoreId:
              item.id

          })
        )
        .filter(

          credit =>

            !normalizedClientId ||
            normalizeId(
              credit.clientId
            ) ===
            normalizedClientId

        );


    /*
     * Preferimos crÃ©ditos activos.
     */

    /*
     * Un creditId de negocio antiguo puede ser distinto
     * del ID real del documento Firestore.
     */
    if (
      normalizedCreditId
    ) {

      const matchingCredit =
        clientCredits.find(

          credit =>

            normalizeId(
              credit.creditId
            ) ===
            normalizedCreditId ||

            normalizeId(
              credit.legacyCreditId
            ) ===
            normalizedCreditId

        );


      if (
        matchingCredit
      ) {

        return matchingCredit;

      }


      return null;

    }


    const activeCredits =
      clientCredits.filter(

        credit =>

          String(
            credit.status || ""
          ).trim() !==
          "Pagado"

      );


    /*
     * Si solamente existe un crÃ©dito activo,
     * ese es el crÃ©dito correcto.
     */

    if (
      activeCredits.length === 1
    ) {

      return activeCredits[0];

    }


    /*
     * Si hay varios, buscamos el que tenga
     * saldo pendiente.
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
     * Ãšltimo respaldo:
     * si solamente existe un crÃ©dito del cliente.
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
   REGISTRAR PAGO DE CRÃ‰DITO
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
      "companyId no es válido"
    );

  }


  if (
    !creditId ||
    typeof creditId !== "string"
  ) {

    /*
     * No abortamos inmediatamente.
     *
     * Puede existir un creditId antiguo o incorrecto
     * y podemos recuperar el crÃ©dito utilizando
     * payment.clientId.
     */

    if (
      !normalizeId(
        payment?.clientId
      )
    ) {

      throw new Error(
        "El ID del crédito no es válido."
      );

    }

  }


  /* ====================================================
     RESOLVER CRÃ‰DITO REAL
  ==================================================== */

  const credit =
    await resolveCredit(

      companyId,

      creditId,

      payment?.clientId

    );


  if (
    !credit
  ) {

    console.error(
      "No se pudo resolver el crÃ©dito:",
      {
        companyId,

        creditId,

        clientId:
          payment?.clientId

      }
    );


    throw new Error(
      "Crédito no encontrado"
    );

  }


  /*
   * MUY IMPORTANTE:
   *
   * Usamos siempre el ID REAL del documento
   * encontrado en Firestore.
   */

  const realCreditId =
    normalizeId(
      credit.id
    );


  if (
    !realCreditId
  ) {

    throw new Error(
      "El crédito encontrado no tiene un ID válido."
    );

  }


  /* ====================================================
     REFERENCIA REAL DEL CRÃ‰DITO
  ==================================================== */

  const creditRef =
    doc(
      db,
      "companies",
      companyId,
      "credits",
      realCreditId
    );


  /* ====================================================
     OBTENER PAGOS
  ==================================================== */

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
          item.data()
            .installmentNumber || 0
        )

    );


  const nextInstallment =
    Math.max(
      ...usedInstallments,
      0
    ) + 1;


  const paymentValue =
    Number(
      payment?.value || 0
    );


  if (
    paymentValue <= 0
  ) {

    throw new Error(
      "El valor del pago debe ser mayor que cero."
    );

  }


  /* ====================================================
     CREAR PAGO
  ==================================================== */

  const paymentWithInstallment = {

    ...payment,

    value:
      paymentValue,

    installmentNumber:
      nextInstallment,

    creditId:
      realCreditId

  };


  const savedPayment =
    await createPayment(

      companyId,

      realCreditId,

      paymentWithInstallment

    );


  /* ====================================================
     CALCULAR NUEVOS VALORES
  ==================================================== */

  const paidAmount =

    Number(
      credit.paidAmount || 0
    ) +

    paymentValue;


  const originalTotal =
    Number(
      credit.total ||
      credit.amount ||
      0
    );


  const balance =
    Math.max(

      originalTotal -

      paidAmount,

      0

    );


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


  /* ====================================================
     CALCULAR PRÃ“XIMA FECHA
  ==================================================== */

  let nextPaymentDate =
    credit.nextPaymentDate ||
    null;


  if (
    pendingInstallments > 0
  ) {

    nextPaymentDate =
      calculateNextPaymentDate(
        credit
      );

  } else {

    nextPaymentDate =
      null;

  }


  /* ====================================================
     ACTUALIZAR CRÃ‰DITO
  ==================================================== */

  const updatedCredit = {

    balance,

    paidAmount,

    paidInstallments,

    pendingInstallments,

    nextPaymentDate,

    status:

      balance === 0

        ? "Pagado"

        : "Activo"

  };


  await updateDoc(

    creditRef,

    updatedCredit

  );


  /* ====================================================
     CREAR SIGUIENTE RUTA AUTOMÃTICA
  ==================================================== */

  let updatedRoute =
    null;


  if (

    pendingInstallments > 0 &&

    nextPaymentDate &&

    credit.clientId

  ) {

    try {

      updatedRoute =
        await assignClientAutomaticallyToRoute(

          companyId,

          credit.clientId,

          nextPaymentDate,

          realCreditId

        );

    } catch (error) {

      console.error(

        "Error preparando la siguiente ruta automÃ¡tica:",

        error

      );

    }

  }


  return {

    payment:
      savedPayment,

    updatedCredit: {

      ...credit,

      ...updatedCredit,

      id:
        realCreditId

    },

    updatedRoute

  };

}


/* ======================================================
   ELIMINAR PAGO DE CRÃ‰DITO
====================================================== */

export async function deleteCreditPayment(
  companyId,
  creditId,
  paymentId
) {

  const resolvedCredit =
    await resolveCredit(
      companyId,
      creditId
    );


  if (
    !resolvedCredit
  ) {

    throw new Error(
      "Crédito no encontrado"
    );

  }


  const realCreditId =
    normalizeId(
      resolvedCredit.id
    );


  await removePayment(

    companyId,

    realCreditId,

    paymentId

  );


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


  if (
    !creditSnapshot.exists()
  ) {

    throw new Error(
      "Crédito no encontrado"
    );

  }


  const credit =
    creditSnapshot.data();


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


  const originalTotal =
    Number(
      credit.total ||
      credit.amount ||
      0
    );


  const balance =
    Math.max(

      originalTotal -

      paidAmount,

      0

    );


  const updatedCredit = {

    balance,

    paidAmount,

    paidInstallments,

    pendingInstallments,

    status:

      balance === 0

        ? "Pagado"

        : "Activo"

  };


  await updateDoc(

    creditRef,

    updatedCredit

  );


  return {

    updatedCredit: {

      ...credit,

      ...updatedCredit,

      id:
        realCreditId

    }

  };

}
