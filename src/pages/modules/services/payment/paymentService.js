import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "../../../../config/firebase";

import {
  createNotification
} from "../notifications/notificationService";




/* ======================================================
   Obtener pagos
====================================================== */

export async function getPayments(

  companyId,

  creditId

){

  const paymentsRef = collection(

    db,

    "companies",

    companyId,

    "credits",

    creditId,

    "payments"

  );

  const snapshot = await getDocs(

    paymentsRef

  );

  return snapshot.docs.map(item => ({

    id:item.id,

    ...item.data()

  }));

}




/* ======================================================
   Crear pago
====================================================== */

export async function createPayment(

  companyId,

  creditId,

  payment

){

  const paymentsRef = collection(

    db,

    "companies",

    companyId,

    "credits",

    creditId,

    "payments"

  );


  const result = await addDoc(

    paymentsRef,

    payment

  );



  /*---------------------------------------
      Crear notificación automática
  ---------------------------------------*/

  await createNotification({

    companyId,

    title:"Pago registrado",

    message:`${payment.client} realizó un pago por $${Number(

      payment.amount || 0

    ).toLocaleString()}`,

    type:"success",

    module:"payments",

    referenceId:result.id

  });



  return {

    id:result.id,

    ...payment

  };

}




/* ======================================================
   Actualizar pago
====================================================== */

export async function updatePayment(

  companyId,

  creditId,

  paymentId,

  data

){

  const paymentRef = doc(

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
   Eliminar pago
====================================================== */

export async function removePayment(

  companyId,

  creditId,

  paymentId

){

  const paymentRef = doc(

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