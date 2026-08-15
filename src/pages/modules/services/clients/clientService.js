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

import {
  assignClientAutomaticallyToRoute
} from "../routes/routeService";


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

  const snapshot =
    await getDocs(clientsRef);

  return snapshot.docs.map(item => {

    const data = {
      ...item.data()
    };

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

  const snapshot =
    await getDoc(clientRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = {
    ...snapshot.data()
  };

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

  const {
    id,
    ...clientData
  } = client;

  const clientsRef = collection(
    db,
    "companies",
    companyId,
    "clients"
  );

  const result =
    await addDoc(
      clientsRef,
      clientData
    );

  const createdClient = {
    id: result.id,
    ...clientData
  };


  // =====================================================
  // AUTOMATIZACIÓN DE RUTA
  // =====================================================

  if (
    createdClient.city &&
    createdClient.nextPaymentDate
  ) {

    try {

      await assignClientAutomaticallyToRoute(

        companyId,

        result.id,

        createdClient.nextPaymentDate

      );

    } catch (error) {

      console.error(
        "Error asignando cliente a ruta automática:",
        error
      );

    }

  }


  return createdClient;

}


// =======================================================
// Actualizar cliente
// =======================================================

export async function updateClient(
  companyId,
  clientId,
  data
) {

  const {
    id,
    ...clientData
  } = data;

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


  // =====================================================
  // AUTOMATIZACIÓN DE RUTA
  // =====================================================

  if (
    clientData.city &&
    clientData.nextPaymentDate
  ) {

    try {

      await assignClientAutomaticallyToRoute(

        companyId,

        String(clientId),

        clientData.nextPaymentDate

      );

    } catch (error) {

      console.error(
        "Error actualizando ruta automática del cliente:",
        error
      );

    }

  }

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