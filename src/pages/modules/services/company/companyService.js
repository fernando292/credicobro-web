import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

import { db } from "../../../../config/firebase";



export async function createCompany(company) {


  const companiesRef = collection(

    db,

    "companies"

  );


  const result = await addDoc(

    companiesRef,

    company

  );


  return result.id;

}





export async function createUserProfile(

  uid,

  data

) {


  const userRef = doc(

    db,

    "users",

    uid

  );



  await setDoc(

    userRef,

    data

  );

}





export async function getUserProfile(uid) {


  const userRef = doc(

    db,

    "users",

    uid

  );



  const snapshot = await getDoc(

    userRef

  );



  if (!snapshot.exists()) {

    return null;

  }



  return {

    id: snapshot.id,

    ...snapshot.data()

  };


}