import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "../../../../config/firebase";



// Obtener clientes

export async function getClients(companyId) {


  const clientsRef = collection(

    db,

    "companies",

    companyId,

    "clients"

  );


  const snapshot = await getDocs(clientsRef);



  return snapshot.docs.map((item)=>({

    id:item.id,

    ...item.data()

  }));

}




// Obtener cliente por ID

export async function getClientById(

  companyId,

  clientId

){


  const clientRef = doc(

    db,

    "companies",

    companyId,

    "clients",

    clientId

  );



  const snapshot = await getDoc(clientRef);



  if(!snapshot.exists()){

    return null;

  }



  return {

    id:snapshot.id,

    ...snapshot.data()

  };


}






// Crear cliente

export async function createClient(

  companyId,

  client

){


  const clientsRef = collection(

    db,

    "companies",

    companyId,

    "clients"

  );



  const result = await addDoc(

    clientsRef,

    client

  );



  return {

    id:result.id,

    ...client

  };


}






// Actualizar cliente

export async function updateClient(

  companyId,

  clientId,

  data

){


  const clientRef = doc(

    db,

    "companies",

    companyId,

    "clients",

    clientId

  );



  await updateDoc(

    clientRef,

    data

  );


}






// Eliminar cliente

export async function removeClient(

  companyId,

  clientId

){


  const clientRef = doc(

    db,

    "companies",

    companyId,

    "clients",

    clientId

  );



  await deleteDoc(

    clientRef

  );


}