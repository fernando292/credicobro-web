import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../../../config/firebase";




// Obtener seguimientos

export async function getFollowUps(companyId) {

  try {


    const followUpsRef = collection(

      db,

      "companies",

      companyId,

      "collectionFollowUps"

    );



    const q = query(

      followUpsRef,

      where(

        "companyId",

        "==",

        companyId

      )

    );



    const snapshot = await getDocs(q);



    return snapshot.docs.map((item)=>(

      {

        id:item.id,

        ...item.data()

      }

    ));



  } catch(error) {


    console.error(

      "Error obteniendo seguimientos",

      error

    );


    return [];

  }

}








// Crear seguimiento

export async function createFollowUp(data) {


  try {


    const followUpsRef = collection(

      db,

      "companies",

      data.companyId,

      "collectionFollowUps"

    );



    const result = await addDoc(

      followUpsRef,

      {

        ...data,

        createdAt: serverTimestamp()

      }

    );



    return {

      id:result.id,

      ...data

    };



  } catch(error) {


    console.error(

      "Error creando seguimiento",

      error

    );


    throw error;


  }

}








// Actualizar seguimiento

export async function updateFollowUp(

  companyId,

  followUpId,

  data

){


  try {


    const followUpRef = doc(

      db,

      "companies",

      companyId,

      "collectionFollowUps",

      followUpId

    );



    await updateDoc(

      followUpRef,

      data

    );



  } catch(error) {


    console.error(

      "Error actualizando seguimiento",

      error

    );


    throw error;


  }

}