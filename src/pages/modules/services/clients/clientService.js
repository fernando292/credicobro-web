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



// =======================================================
// Obtener clientes
// =======================================================

export async function getClients(companyId) {

  const clientsRef = collection(

    db,

    "companies",

    companyId,

    "clients"

  );

  const snapshot = await getDocs(clientsRef);

  return snapshot.docs.map(item => {

    const data = item.data();

    delete data.id;

    return {

      id: item.id,

      ...data

    };

  });

}



// =======================================================
// Obtener cliente por ID
// =======================================================

export async function getClientById(

  companyId,

  clientId

) {

  const clientRef = doc(

    db,

    "companies",

    companyId,

    "clients",

    String(clientId)

  );

  const snapshot = await getDoc(clientRef);

  if (!snapshot.exists()) {

    return null;

  }

  const data = snapshot.data();

  delete data.id;

  return {

    id: snapshot.id,

    ...data

  };

}



// =======================================================
// Crear cliente
// =======================================================

export async function createClient(

  companyId,

  client

) {

  const { id, ...clientData } = client;

  const clientsRef = collection(

    db,

    "companies",

    companyId,

    "clients"

  );

  const result = await addDoc(

    clientsRef,

    clientData

  );

  return {

    id: result.id,

    ...clientData

  };

}



// =======================================================
// Actualizar cliente
// =======================================================

export async function updateClient(

  companyId,

  clientId,

  data

) {

  const { id, ...clientData } = data;

  const clientRef = doc(

    db,

    "companies",

    String(companyId),

    "clients",

    String(clientId)

  );

  await updateDoc(

    clientRef,

    clientData

  );

}



// =======================================================
// Eliminar cliente
// =======================================================

export async function removeClient(

  companyId,

  clientId

) {

  const clientRef = doc(

    db,

    "companies",

    String(companyId),

    "clients",

    String(clientId)

  );

  await deleteDoc(

    clientRef

  );

}