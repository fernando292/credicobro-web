import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "../../../../config/firebase";



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


  return {

    id:result.id,

    ...payment

  };

}




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