import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../../../config/firebase";

import {
  registerCreditPayment
} from "../credit/creditBusinessService";


const VISIT_STATUSES = [
  "Pendiente",
  "Cobrado",
  "Pago parcial",
  "No pagó",
  "No atendió",
  "Reprogramado"
];


function getRouteRef(companyId, routeId) {
  return doc(
    db,
    "companies",
    companyId,
    "routes",
    routeId
  );
}


function getVisitsRef(companyId, routeId) {
  return collection(
    db,
    "companies",
    companyId,
    "routes",
    routeId,
    "visits"
  );
}


/* ======================================================
   CREAR LAS VISITAS QUE FALTAN EN UNA RUTA
====================================================== */

export async function ensureRouteVisits(
  companyId,
  routeId,
  clientIds
) {
  if (!companyId || !routeId) {
    throw new Error(
      "companyId y routeId son obligatorios"
    );
  }

  const uniqueClientIds = [
    ...new Set(
      Array.isArray(clientIds)
        ? clientIds.filter(Boolean)
        : []
    )
  ];

  const visitsRef = getVisitsRef(
    companyId,
    routeId
  );

  const snapshot = await getDocs(visitsRef);

  const existingVisitIds = new Set(
    snapshot.docs.map(item => item.id)
  );

  await Promise.all(
    uniqueClientIds
      .filter(clientId => !existingVisitIds.has(clientId))
      .map(clientId =>
        setDoc(
          doc(visitsRef, clientId),
          {
            clientId,
            status: "Pendiente",
            collectedAmount: 0,
            paymentId: null,
            creditId: null,
            paymentMethod: null,
            notes: "",
            visitedAt: null,
            createdAt: serverTimestamp()
          }
        )
      )
  );

  return getRouteVisits(companyId, routeId);
}


/* ======================================================
   OBTENER VISITAS DE UNA RUTA
====================================================== */

export async function getRouteVisits(
  companyId,
  routeId
) {
  const snapshot = await getDocs(
    getVisitsRef(companyId, routeId)
  );

  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}


/* ======================================================
   REGISTRAR RESULTADO DE UNA VISITA
====================================================== */

export async function registerRouteVisit(
  companyId,
  routeId,
  visitId,
  data
) {
  if (!companyId || !routeId || !visitId) {
    throw new Error(
      "companyId, routeId y visitId son obligatorios"
    );
  }

  const status = data.status || "Pendiente";

  if (!VISIT_STATUSES.includes(status)) {
    throw new Error("El estado de la visita no es válido");
  }

  const visitRef = doc(
    getVisitsRef(companyId, routeId),
    visitId
  );

  const visitSnapshot = await getDoc(visitRef);

  if (!visitSnapshot.exists()) {
    throw new Error("La visita no existe");
  }

  const currentVisit = visitSnapshot.data();
  const value = Number(data.value || 0);

  if (value < 0) {
    throw new Error("El valor recaudado no puede ser negativo");
  }

  if (value > 0 && !data.creditId) {
    throw new Error("Selecciona el crédito al que aplicar el recaudo");
  }

  if (value > 0 && currentVisit.paymentId) {
    throw new Error(
      "Esta visita ya tiene un pago registrado."
    );
  }

  let payment = null;
  let updatedCredit = null;

  if (value > 0) {
    const paymentResult = await registerCreditPayment(
      companyId,
      data.creditId,
      {
        value,
        method: data.method || "Efectivo",
        date: data.date || new Date().toISOString().split("T")[0],
        client: data.clientName || "Cliente",
        clientId: currentVisit.clientId,
        routeId,
        visitId,
        source: "route"
      }
    );

    payment = paymentResult.payment;
    updatedCredit = paymentResult.updatedCredit;
  }

  await updateDoc(
    visitRef,
    {
      status,
      notes: data.notes || "",
      collectedAmount: value,
      creditId: data.creditId || null,
      paymentId: payment?.id || null,
      paymentMethod: value > 0
        ? data.method || "Efectivo"
        : null,
      visitedAt: status === "Pendiente"
        ? null
        : serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  );

  const updatedRoute = await syncRouteSummary(
    companyId,
    routeId
  );

  const updatedVisit = await getDoc(visitRef);

  return {
    visit: {
      id: updatedVisit.id,
      ...updatedVisit.data()
    },
    updatedRoute,
    payment,
    updatedCredit
  };
}


/* ======================================================
   SINCRONIZAR RESUMEN DE LA RUTA
====================================================== */

export async function syncRouteSummary(
  companyId,
  routeId
) {
  const routeRef = getRouteRef(companyId, routeId);
  const routeSnapshot = await getDoc(routeRef);

  if (!routeSnapshot.exists()) {
    throw new Error("La ruta no existe");
  }

  const route = routeSnapshot.data();
  const clientIds = Array.isArray(route.clientIds)
    ? route.clientIds
    : [];

  const activeClientIds = new Set(clientIds);
  const visits = await getRouteVisits(companyId, routeId);

  const activeVisits = visits.filter(visit =>
    activeClientIds.has(visit.clientId)
  );

  const completedVisits = activeVisits.filter(
    visit => visit.status !== "Pendiente"
  ).length;

  const collected = activeVisits.reduce(
    (total, visit) =>
      total + Number(visit.collectedAmount || 0),
    0
  );

  const totalVisits = clientIds.length;

  const status = totalVisits > 0 && completedVisits === totalVisits
    ? "Completada"
    : completedVisits > 0
      ? "En progreso"
      : "Pendiente";

  const summary = {
    totalVisits,
    completedVisits,
    collected,
    status,
    updatedAt: serverTimestamp()
  };

  await updateDoc(routeRef, summary);

  return {
    id: routeId,
    ...route,
    ...summary
  };
}
