import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { db } from "../../../../config/firebase";


function getRoutesRef(companyId) {
  return collection(
    db,
    "companies",
    companyId,
    "routes"
  );
}


function getRouteRef(companyId, routeId) {
  return doc(
    db,
    "companies",
    companyId,
    "routes",
    routeId
  );
}


/* ======================================================
   OBTENER RUTAS
====================================================== */

export async function getRoutes(companyId) {
  if (!companyId) {
    throw new Error(
      "companyId es obligatorio"
    );
  }

  const routesRef = getRoutesRef(companyId);

  const routesQuery = query(
    routesRef,
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(routesQuery);

  return snapshot.docs.map(route => ({
    id: route.id,
    ...route.data()
  }));
}


/* ======================================================
   OBTENER RUTA POR ID
====================================================== */

export async function getRouteById(
  companyId,
  routeId
) {
  if (!companyId || !routeId) {
    throw new Error(
      "companyId y routeId son obligatorios"
    );
  }

  const routeRef = getRouteRef(
    companyId,
    routeId
  );

  const snapshot = await getDoc(routeRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
}


/* ======================================================
   CREAR RUTA
====================================================== */

export async function createRoute(
  companyId,
  data
) {
  if (!companyId) {
    throw new Error(
      "companyId es obligatorio"
    );
  }

  const routesRef = getRoutesRef(companyId);

  const routeData = {
    name: data.name,
    date: data.date,
    zone: data.zone || "",
    description: data.description || "",
    status: "Pendiente",
    clientIds: [],
    completedVisits: 0,
    totalVisits: 0,
    collected: 0,
    createdAt: serverTimestamp()
  };

  const result = await addDoc(
    routesRef,
    routeData
  );

  return {
    id: result.id,
    ...routeData
  };
}


/* ======================================================
   ACTUALIZAR RUTA
====================================================== */

export async function updateRoute(
  companyId,
  routeId,
  data
) {
  if (!companyId || !routeId) {
    throw new Error(
      "companyId y routeId son obligatorios"
    );
  }

  const routeRef = getRouteRef(
    companyId,
    routeId
  );

  const {
    id,
    ...routeData
  } = data;

  await updateDoc(
    routeRef,
    routeData
  );
}


/* ======================================================
   ASIGNAR CLIENTES A UNA RUTA
====================================================== */

export async function assignClientsToRoute(
  companyId,
  routeId,
  clientIds
) {
  if (!companyId || !routeId) {
    throw new Error(
      "companyId y routeId son obligatorios"
    );
  }

  const routeRef = getRouteRef(
    companyId,
    routeId
  );

  const uniqueClientIds = [
    ...new Set(
      Array.isArray(clientIds)
        ? clientIds.filter(Boolean)
        : []
    )
  ];

  await updateDoc(
    routeRef,
    {
      clientIds: uniqueClientIds,
      totalVisits: uniqueClientIds.length
    }
  );

  return {
    clientIds: uniqueClientIds,
    totalVisits: uniqueClientIds.length
  };
}


/* ======================================================
   AGREGAR CLIENTES A UNA RUTA EXISTENTE
====================================================== */

export async function addClientsToRoute(
  companyId,
  routeId,
  clientIds
) {
  const route = await getRouteById(
    companyId,
    routeId
  );

  if (!route) {
    throw new Error(
      "La ruta no existe."
    );
  }

  const currentClientIds = Array.isArray(
    route.clientIds
  )
    ? route.clientIds
    : [];

  const newClientIds = Array.isArray(clientIds)
    ? clientIds
    : [];

  return assignClientsToRoute(
    companyId,
    routeId,
    [
      ...new Set([
        ...currentClientIds,
        ...newClientIds
      ])
    ]
  );
}


/* ======================================================
   QUITAR CLIENTES DE UNA RUTA
====================================================== */

export async function removeClientsFromRoute(
  companyId,
  routeId,
  clientIds
) {
  const route = await getRouteById(
    companyId,
    routeId
  );

  if (!route) {
    throw new Error(
      "La ruta no existe."
    );
  }

  const clientsToRemove = new Set(
    Array.isArray(clientIds)
      ? clientIds
      : []
  );

  const remainingClientIds = (
    Array.isArray(route.clientIds)
      ? route.clientIds
      : []
  ).filter(
    id => !clientsToRemove.has(id)
  );

  return assignClientsToRoute(
    companyId,
    routeId,
    remainingClientIds
  );
}


/* ======================================================
   ELIMINAR RUTA
====================================================== */

export async function removeRoute(
  companyId,
  routeId
) {
  if (!companyId || !routeId) {
    throw new Error(
      "companyId y routeId son obligatorios"
    );
  }

  await deleteDoc(
    getRouteRef(companyId, routeId)
  );
}
