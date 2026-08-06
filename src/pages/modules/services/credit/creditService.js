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



/* ======================================================
   Obtener créditos
====================================================== */

export async function getCredits(companyId) {

  const creditsRef = collection(
    db,
    "companies",
    companyId,
    "credits"
  );

  const snapshot = await getDocs(
    creditsRef
  );

  return snapshot.docs.map(item => ({

    firestoreId: item.id,

    ...item.data(),

    id: item.id

  }));

}



/* ======================================================
   Obtener crédito
====================================================== */

export async function getCreditById(

  companyId,

  creditId

) {

  const creditRef = doc(

    db,

    "companies",

    companyId,

    "credits",

    creditId

  );

  const snapshot = await getDoc(
    creditRef
  );

  if (!snapshot.exists()) {

    return null;

  }

  return {

    firestoreId: snapshot.id,

    ...snapshot.data(),

    id: snapshot.id

  };

}



/* ======================================================
   Crear crédito
====================================================== */

export async function createCredit(

  companyId,

  credit

) {

  const creditsRef = collection(

    db,

    "companies",

    companyId,

    "credits"

  );

  const result = await addDoc(

    creditsRef,

    credit

  );



  /*----------------------------------
      Crear notificación automática
  -----------------------------------*/

  await createNotification({

    companyId,

    title: "Nuevo crédito",

    message: `${credit.client} recibió un crédito por $${Number(

      credit.amount || 0

    ).toLocaleString()}`,

    type: "success",

    module: "credits",

    referenceId: result.id

  });



  return {

    firestoreId: result.id,

    ...credit,

    id: result.id

  };

}



/* ======================================================
   Actualizar crédito
====================================================== */

export async function updateCredit(

  companyId,

  creditId,

  data

) {

  const creditRef = doc(

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

}



/* ======================================================
   Eliminar crédito
====================================================== */

export async function removeCredit(

  companyId,

  creditId

) {

  const creditRef = doc(

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
   Aplicar pago
====================================================== */

export async function applyPaymentToCredit(

  companyId,

  creditId,

  paymentValue

) {

  const creditRef = doc(

    db,

    "companies",

    companyId,

    "credits",

    creditId

  );

  const snapshot = await getDoc(

    creditRef

  );

  if (!snapshot.exists()) {

    throw new Error(

      "Crédito no encontrado"

    );

  }

  const credit = snapshot.data();

  const newBalance = Math.max(

    Number(credit.balance || 0)

    - Number(paymentValue),

    0

  );

  await updateDoc(

    creditRef,

    {

      balance: newBalance,

      paidAmount:

        Number(credit.paidAmount || 0)

        + Number(paymentValue),

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