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


function getPaymentSortValue(payment) {

  if (!payment) {

    return 0;

  }


  if (
    payment.createdAt &&
    typeof payment.createdAt.toMillis === "function"
  ) {

    return payment.createdAt.toMillis();

  }


  if (
    payment.createdAt &&
    typeof payment.createdAt.seconds === "number"
  ) {

    return (
      payment.createdAt.seconds * 1000 +
      Math.floor(
        Number(
          payment.createdAt.nanoseconds || 0
        ) / 1000000
      )
    );

  }


  if (payment.date) {

    const dateValue =
      new Date(
        `${String(payment.date).slice(0, 10)}T00:00:00`
      ).getTime();


    if (!Number.isNaN(dateValue)) {

      return dateValue;

    }

  }


  return 0;

}


/* ======================================================
   PROGRESO DE CUOTAS
====================================================== */

function calculateInstallmentProgress(
  payments,
  installmentValue,
  totalInstallments
) {

  const baseInstallmentValue =
    Number(installmentValue || 0);

  const total =
    Number(totalInstallments || 0);


  if (
    baseInstallmentValue <= 0 ||
    total <= 0
  ) {

    return {

      allocations: [],

      installments: [],

      paidInstallments: 0,

      pendingInstallments: Math.max(
        total,
        0
      )

    };

  }


  const sortedPayments =
    (Array.isArray(payments)
      ? payments
      : []
    )
      .map(
        (
          payment,
          index
        ) => ({

          payment,

          originalIndex:
            index

        })
      )
      .sort(
        (
          a,
          b
        ) => {

          const difference =
            getPaymentSortValue(
              a.payment
            ) -
            getPaymentSortValue(
              b.payment
            );


          if (difference !== 0) {

            return difference;

          }


          return (
            a.originalIndex -
            b.originalIndex
          );

        }
      );


  /*
   * --------------------------------------------------
   * Cada cuota conserva su valor base.
   *
   * Cuando una cuota queda incompleta, el saldo
   * pendiente se arrastra a la siguiente cuota.
   *
   * Ejemplo:
   *
   * Cuota 1 = 4.000
   * Pago     = 3.000
   * Pendiente = 1.000
   *
   * Cuota 2 = 4.000 + 1.000 = 5.000
   * --------------------------------------------------
   */

  const paidByInstallment =
    Array(total).fill(0);

  const dueByInstallment =
    Array(total).fill(
      baseInstallmentValue
    );


  const paymentAllocations = [];


  /*
   * El cursor indica la cuota que actualmente
   * está siendo atendida por los pagos.
   *
   * Los pagos se distribuyen desde la cuota actual
   * hacia las siguientes si existe excedente.
   */

  let currentInstallment = 0;


  for (
    const paymentEntry of sortedPayments
  ) {

    const payment =
      paymentEntry.payment;

    let remaining =
      Number(
        payment?.value || 0
      );


    if (remaining <= 0) {

      paymentAllocations.push({

        paymentId:
          payment?.id || null,

        value:
          Number(
            payment?.value || 0
          ),

        allocations: []

      });

      continue;

    }


    const allocations = [];


    while (
      remaining > 0 &&
      currentInstallment < total
    ) {

      const installmentIndex =
        currentInstallment;


      const due =
        Number(
          dueByInstallment[
            installmentIndex
          ] || baseInstallmentValue
        );


      const alreadyPaid =
        Number(
          paidByInstallment[
            installmentIndex
          ] || 0
        );


      const pending =
        Math.max(
          due -
          alreadyPaid,
          0
        );


      /*
       * Si por alguna razón la cuota ya está completa,
       * avanzamos a la siguiente.
       */

      if (pending <= 0) {

        currentInstallment += 1;

        continue;

      }


      const amount =
        Math.min(
          remaining,
          pending
        );


      paidByInstallment[
        installmentIndex
      ] += amount;


      remaining -= amount;


      allocations.push({

        installmentNumber:
          installmentIndex + 1,

        amount

      });


      /*
       * Si la cuota quedó completa,
       * el excedente continúa en la siguiente.
       */

      if (
        paidByInstallment[
          installmentIndex
        ] >= due
      ) {

        /*
         * La siguiente cuota recibe únicamente
         * el saldo pendiente de la cuota actual.
         */

        const shortfall = 0;

        if (
          installmentIndex + 1 <
          total
        ) {

          dueByInstallment[
            installmentIndex + 1
          ] =
            baseInstallmentValue +
            shortfall;

        }


        currentInstallment += 1;

      }

    }


    /*
     * Si la cuota actual quedó parcial, el saldo
     * pendiente se incorpora a la siguiente cuota.
     *
     * Esto se calcula después de aplicar el pago.
     */

    for (
      let index = 0;
      index < total - 1;
      index++
    ) {

      const due =
        Number(
          dueByInstallment[index] ||
          baseInstallmentValue
        );

      const paid =
        Number(
          paidByInstallment[index] || 0
        );

      const shortfall =
        Math.max(
          due - paid,
          0
        );


      if (shortfall > 0) {

        dueByInstallment[
          index + 1
        ] =
          baseInstallmentValue +
          shortfall;

      }

    }


    paymentAllocations.push({

      paymentId:
        payment?.id || null,

      value:
        Number(
          payment?.value || 0
        ),

      allocations

    });

  }


  /*
   * --------------------------------------------------
   * Construir estado final de cuotas.
   * --------------------------------------------------
   */

  const installments = [];


  for (
    let index = 0;
    index < total;
    index++
  ) {

    const due =
      Number(
        dueByInstallment[index] ||
        baseInstallmentValue
      );

    const paid =
      Number(
        paidByInstallment[index] || 0
      );

    const pending =
      Math.max(
        due - paid,
        0
      );


    let status = "Pendiente";


    if (paid >= due) {

      status = "Pagada";

    } else if (paid > 0) {

      status = "Pago parcial";

    }


    installments.push({

      number:
        index + 1,

      baseValue:
        baseInstallmentValue,

      value:
        due,

      paidAmount:
        paid,

      pendingAmount:
        pending,

      status

    });

  }


  const paidInstallments =
    installments.filter(
      installment =>
        installment.status === "Pagada"
    ).length;


  const pendingInstallments =
    Math.max(
      total -
      paidInstallments,
      0
    );


  return {

    allocations:
      paymentAllocations,

    installments,

    paidInstallments,

    pendingInstallments

  };

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

    case "Diario":

      currentDate.setDate(
        currentDate.getDate() + 1
      );

      break;


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


  const existingPayments =
    paymentsSnapshot.docs.map(
      item => ({

        id:
          item.id,

        ...item.data()

      })
    );


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
   * Datos de cuotas
   */

  const totalInstallments =
    Number(
      credit.installments || 0
    );


  const installmentValue =
    Number(
      credit.installmentValue || 0
    );


  /*
   * Calcular el progreso ANTES de guardar
   * para conocer exactamente cómo se distribuye
   * el nuevo pago.
   */

  const progressBeforePayment =
    calculateInstallmentProgress(
      existingPayments,
      installmentValue,
      totalInstallments
    );


  const nextInstallment =
    Math.min(
      Math.max(
        progressBeforePayment.paidInstallments + 1,
        1
      ),
      Math.max(
        totalInstallments,
        1
      )
    );


  /*
   * Calcular asignación incluyendo el nuevo pago.
   *
   * El ID todavía no existe, por lo que utilizamos
   * un marcador temporal y posteriormente
   * actualizamos la asignación guardada con el ID real.
   */

  const temporaryPayment = {

    ...payment,

    value:
      paymentValue,

    id:
      "__NEW_PAYMENT__"

  };


  const progressWithNewPayment =
    calculateInstallmentProgress(
      [
        ...existingPayments,
        temporaryPayment
      ],
      installmentValue,
      totalInstallments
    );


  const newPaymentAllocation =
    progressWithNewPayment.allocations.find(
      allocation =>
        allocation.paymentId ===
        "__NEW_PAYMENT__"
    );


  /*
   * Determinar la primera cuota afectada.
   */

  const firstAffectedInstallment =
    newPaymentAllocation?.allocations?.[0]
      ?.installmentNumber ||
    nextInstallment;


  /*
   * Preparar pago.
   */

  const paymentWithInstallment = {

    ...payment,

    value:
      paymentValue,

    installmentNumber:
      firstAffectedInstallment,

    installmentAllocations:
      newPaymentAllocation?.allocations || [],

    creditId:
      realCreditId,

    companyId

  };


  /*
   * Guardar pago.
   *
   * createPayment() continúa siendo quien realiza
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
   * RECALCULAR CUOTAS
   * --------------------------------------------------
   *
   * Se vuelven a leer los pagos después de guardar
   * para que el crédito siempre tenga el estado
   * completo y no dependa únicamente del último pago.
   */

  const refreshedPaymentsSnapshot =
    await getDocs(
      paymentsRef
    );


  const refreshedPayments =
    refreshedPaymentsSnapshot.docs.map(
      item => ({

        id:
          item.id,

        ...item.data()

      })
    );


  const installmentProgress =
    calculateInstallmentProgress(
      refreshedPayments,
      Number(
        updatedCreditData.installmentValue || 0
      ),
      Number(
        updatedCreditData.installments || 0
      )
    );


  const paidInstallments =
    installmentProgress.paidInstallments;


  const pendingInstallments =
    installmentProgress.pendingInstallments;


  /*
   * --------------------------------------------------
   * SIGUIENTE FECHA
   * --------------------------------------------------
   */

  let nextPaymentDate =
    updatedCreditData.nextPaymentDate ||
    null;


  const isDaily =
    updatedCreditData.frequency ===
    "Diario";


  const hasRemainingBalance =
    Number(
      updatedCreditData.balance || 0
    ) > 0;


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

    nextPaymentDate,

    installmentProgress:
      installmentProgress.installments

  };


  /*
   * Actualizar solamente datos de cuotas.
   *
   * Los campos financieros continúan siendo
   * responsabilidad de createPayment().
   */

  await updateDoc(
    creditRef,
    installmentData
  );


  /*
   * --------------------------------------------------
   * SINCRONIZAR PAGO CON VISITA DE RUTA
   * --------------------------------------------------
   *
   * Este bloque solamente actúa cuando el pago
   * nació desde Créditos.
   *
   * Si el pago nació desde Rutas, se mantiene
   * el flujo actual de registerRouteVisit().
   */

  let paymentRoute =
    null;


  if (
    updatedCreditData.clientId &&
    payment?.date &&
    !payment?.routeId &&
    !payment?.visitId
  ) {

    try {

      const {
        syncCreditPaymentToRoute
      } = await import(
        "../routes/routeVisitService"
      );


      paymentRoute =
        await syncCreditPaymentToRoute(

          companyId,

          realCreditId,

          updatedCreditData.clientId,

          savedPayment

        );

    } catch (error) {

      /*
       * El pago del crédito ya fue guardado.
       *
       * Si la sincronización de la ruta falla,
       * NO debemos hacer fallar ni revertir
       * el pago del crédito.
       */

      console.error(
        "Error sincronizando pago con visita de ruta:",
        error
      );

    }

  }


  /*
   * --------------------------------------------------
   * ACTUALIZAR RUTA
   * --------------------------------------------------
   */

  let updatedRoute =
    null;


  if (
    (
      pendingInstallments > 0 ||
      (
        isDaily &&
        hasRemainingBalance
      )
    ) &&
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

    updatedRoute,

    paymentRoute

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
      item => ({

        id:
          item.id,

        ...item.data()

      })
    );


  /*
   * Calcular total pagado.
   *
   * Se conserva porque removePayment()
   * es quien recalcula los acumulados financieros.
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
   * --------------------------------------------------
   * RECONSTRUIR CUOTAS
   * --------------------------------------------------
   *
   * No utilizamos únicamente paidAmount / cuota,
   * porque con pagos parciales esa división ya no
   * representa correctamente el estado de las cuotas.
   */

  const installmentProgress =
    calculateInstallmentProgress(
      payments,
      Number(
        credit.installmentValue || 0
      ),
      Number(
        credit.installments || 0
      )
    );


  const paidInstallments =
    installmentProgress.paidInstallments;


  const pendingInstallments =
    installmentProgress.pendingInstallments;


  /*
   * --------------------------------------------------
   * SIGUIENTE FECHA
   * --------------------------------------------------
   *
   * Después de eliminar un pago se reconstruye
   * nuevamente la siguiente fecha desde el estado
   * actual del crédito.
   */

  let nextPaymentDate =
    credit.nextPaymentDate ||
    null;


  if (
    pendingInstallments > 0
  ) {

    /*
     * Si existen pagos restantes, usamos la fecha
     * actual del crédito como base y avanzamos una
     * frecuencia, igual que en el flujo original.
     */

    nextPaymentDate =
      calculateNextPaymentDate({

        ...credit,

        nextPaymentDate

      });

  } else {

    nextPaymentDate =
      null;

  }


  /*
   * Actualizar cuotas y progreso.
   */

  await updateDoc(
    creditRef,
    {

      paidInstallments,

      pendingInstallments,

      nextPaymentDate,

      installmentProgress:
        installmentProgress.installments

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

          pendingInstallments,

          nextPaymentDate,

          installmentProgress:
            installmentProgress.installments

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