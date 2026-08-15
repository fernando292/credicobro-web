import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import { db } from "../../../../config/firebase";

import {
  createNotification
} from "../notifications/notificationService";

import {
  assignClientAutomaticallyToRoute
} from "../routes/routeService";


/* ======================================================
   OBTENER CRÉDITOS
====================================================== */

export async function getCredits(
  companyId
) {

  const creditsRef =
    collection(
      db,
      "companies",
      companyId,
      "credits"
    );

  const snapshot =
    await getDocs(
      creditsRef
    );

  return snapshot.docs.map(
    item => ({

      firestoreId:
        item.id,

      ...item.data(),

      id:
        item.id

    })
  );
}


/* ======================================================
   OBTENER CRÉDITO
====================================================== */

export async function getCreditById(
  companyId,
  creditId
) {

  const creditRef =
    doc(
      db,
      "companies",
      companyId,
      "credits",
      creditId
    );

  const snapshot =
    await getDoc(
      creditRef
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

  const creditsRef =
    collection(
      db,
      "companies",
      companyId,
      "credits"
    );


  /* ====================================================
     CREAR CRÉDITO
  ==================================================== */

  const result =
    await addDoc(
      creditsRef,
      credit
    );


  /* ====================================================
     NOTIFICACIÓN DE CRÉDITO
  ==================================================== */

  await createNotification({

    companyId,

    title:
      "Nuevo crédito",

    message:
      `${credit.client || "Cliente"} recibió un crédito por $${Number(
        credit.amount || 0
      ).toLocaleString()}`,

    type:
      "success",

    module:
      "credits",

    referenceId:
      result.id

  });


  /* ====================================================
     AUTOMATIZACIÓN DE RUTA
  ==================================================== */

  if (credit.clientId) {

    const paymentDate =
      credit.nextPaymentDate ||
      credit.paymentDate ||
      credit.firstPayment ||
      null;


    if (paymentDate) {

      try {

        console.log(
          "Creando / actualizando ruta automática:",
          {
            clientId:
              credit.clientId,

            paymentDate

          }
        );


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

    } else {

      console.warn(

        "El crédito no tiene fecha para crear la ruta automática.",

        credit

      );

    }

  }


  return {

    firestoreId:
      result.id,

    ...credit,

    id:
      result.id

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

  const creditRef =
    doc(
      db,
      "companies",
      companyId,
      "credits",
      creditId
    );


  await updateDoc(
    creditRef,
    data
  );


  /* ====================================================
     AUTOMATIZACIÓN DE RUTA
  ==================================================== */

  if (data.clientId) {

    const paymentDate =
      data.nextPaymentDate ||
      data.paymentDate ||
      data.firstPayment ||
      null;


    if (paymentDate) {

      try {

        console.log(
          "Actualizando ruta automática:",
          {
            clientId:
              data.clientId,

            paymentDate

          }
        );


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

  const creditRef =
    doc(
      db,
      "companies",
      companyId,
      "credits",
      creditId
    );

  await deleteDoc(
    creditRef
  );

}


/* ======================================================
   APLICAR PAGO
====================================================== */

export async function applyPaymentToCredit(
  companyId,
  creditId,
  paymentValue
) {

  const creditRef =
    doc(
      db,
      "companies",
      companyId,
      "credits",
      creditId
    );

  const snapshot =
    await getDoc(
      creditRef
    );


  if (!snapshot.exists()) {

    throw new Error(
      "Crédito no encontrado"
    );

  }


  const credit =
    snapshot.data();


  const newBalance =
    Math.max(

      Number(
        credit.balance || 0
      )

      -

      Number(
        paymentValue
      ),

      0

    );


  await updateDoc(

    creditRef,

    {

      balance:
        newBalance,

      paidAmount:
        Number(
          credit.paidAmount || 0
        )
        +
        Number(
          paymentValue
        ),

      status:
        newBalance === 0
          ? "Pagado"
          : "Activo"

    }

  );


  return await getCreditById(

    companyId,

    creditId

  );

}