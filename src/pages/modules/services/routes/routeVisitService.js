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
  registerCreditPayment,
  resolveCredit
} from "../credit/creditBusinessService";


const VISIT_STATUSES = [
  "Pendiente",
  "Cobrado",
  "Pago parcial",
  "No pagó",
  "No atendió",
  "Reprogramado"
];


/* ======================================================
   REFERENCIAS
====================================================== */

function getRouteRef(
  companyId,
  routeId
) {

  return doc(
    db,
    "companies",
    companyId,
    "routes",
    routeId
  );

}


function getVisitsRef(
  companyId,
  routeId
) {

  return collection(
    db,
    "companies",
    companyId,
    "routes",
    routeId,
    "visits"
  );

}


function getCreditsRef(
  companyId
) {

  return collection(
    db,
    "companies",
    companyId,
    "credits"
  );

}


/* ======================================================
   NORMALIZAR ID
====================================================== */

function normalizeId(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {

    return "";

  }

  return String(
    value
  ).trim();

}


/* ======================================================
   NORMALIZAR FECHA
====================================================== */

function normalizeDate(
  value
) {

  if (!value) {
    return "";
  }

  return String(
    value
  )
    .trim()
    .split("T")[0];

}


/* ======================================================
   OBTENER CRÃ‰DITOS
====================================================== */

async function getCompanyCredits(
  companyId
) {

  const snapshot =
    await getDocs(
      getCreditsRef(
        companyId
      )
    );


  return snapshot.docs.map(
    item => ({

      id:
        item.id,

      firestoreId:
        item.id,

      ...item.data(),

      /*
       * MUY IMPORTANTE:
       * El ID real de Firestore siempre gana.
       */
      id:
        item.id,

      firestoreId:
        item.id

    })
  );

}


/* ======================================================
   BUSCAR CRÃ‰DITO POR CUALQUIER IDENTIFICADOR
====================================================== */

async function findCreditByAnyId(
  companyId,
  creditId
) {

  const normalizedId =
    normalizeId(
      creditId
    );


  if (
    !normalizedId
  ) {

    return null;

  }


  /*
   * PRIMERO:
   * Intentamos directamente como ID real
   * del documento Firestore.
   */

  try {

    const creditRef =
      doc(

        db,

        "companies",

        companyId,

        "credits",

        normalizedId

      );


    const snapshot =
      await getDoc(
        creditRef
      );


    if (
      snapshot.exists()
    ) {

      return {

        id:
          snapshot.id,

        firestoreId:
          snapshot.id,

        ...snapshot.data()

      };

    }

  } catch (error) {

    console.warn(
      "No fue posible consultar crÃ©dito directamente:",
      error
    );

  }


  /*
   * SEGUNDO:
   * Buscamos el ID dentro de los campos guardados
   * del documento.
   *
   * Esto corrige crÃ©ditos antiguos donde:
   *
   * credit.id !== document.id
   *
   */

  const credits =
    await getCompanyCredits(
      companyId
    );


  const matchingCredit =
    credits.find(

      credit =>

        normalizeId(
          credit.id
        ) ===
          normalizedId ||

        normalizeId(
          credit.firestoreId
        ) ===
          normalizedId ||

        normalizeId(
          credit.creditId
        ) ===
          normalizedId

    );


  return (
    matchingCredit ||
    null
  );

}


/* ======================================================
   VALIDAR CRÃ‰DITO POR CLIENTE
====================================================== */

async function getValidCreditById(
  companyId,
  creditId,
  clientId
) {

  return resolveCredit(
    companyId,
    creditId,
    clientId
  );

}


/* ======================================================
   BUSCAR CRÃ‰DITO DE LA VISITA
====================================================== */

async function findCreditForVisit(
  companyId,
  clientId,
  routeDate,
  routeCreditId = null,
  routeCreditByClient = {}
) {

  if (
    !companyId ||
    !clientId
  ) {

    return null;

  }


  const normalizedClientId =
    normalizeId(
      clientId
    );


  if (
    !normalizedClientId
  ) {

    return null;

  }


  const creditByClient =
    routeCreditByClient &&
    typeof routeCreditByClient === "object"
      ? routeCreditByClient
      : {};


  const mappedCreditId =
    normalizeId(
      creditByClient[
        normalizedClientId
      ]
    );


  const explicitCreditId =
    mappedCreditId ||
    normalizeId(
      routeCreditId
    );


  const credits =
    await getCompanyCredits(
      companyId
    );


  /* ====================================================
     1. CRÃ‰DITO EXPLÃCITO
  ==================================================== */

  if (
    explicitCreditId
  ) {

    const explicitCredit =
      credits.find(

        credit =>

          (
            normalizeId(
              credit.id
            ) ===
            explicitCreditId ||

            normalizeId(
              credit.firestoreId
            ) ===
            explicitCreditId ||

            normalizeId(
              credit.creditId
            ) ===
            explicitCreditId

          ) &&

          normalizeId(
            credit.clientId
          ) ===
          normalizedClientId

      );


    if (
      explicitCredit
    ) {

      return explicitCredit;

    }

  }


  /* ====================================================
     2. CRÃ‰DITO POR FECHA DE PAGO
  ==================================================== */

  const normalizedRouteDate =
    normalizeDate(
      routeDate
    );


  if (
    normalizedRouteDate
  ) {

    const matchingCredit =
      credits.find(

        credit =>

          normalizeId(
            credit.clientId
          ) ===
          normalizedClientId &&

          normalizeDate(
            credit.nextPaymentDate
          ) ===
          normalizedRouteDate &&

          String(
            credit.status || ""
          ).trim() !==
          "Pagado"

      );


    if (
      matchingCredit
    ) {

      return matchingCredit;

    }

  }


  /* ====================================================
     3. ÃšNICO CRÃ‰DITO ACTIVO
  ==================================================== */

  const activeCredits =
    credits.filter(

      credit =>

        normalizeId(
          credit.clientId
        ) ===
        normalizedClientId &&

        String(
          credit.status || ""
        ).trim() ===
        "Activo"

    );


  if (
    activeCredits.length === 1
  ) {

    return activeCredits[0];

  }


  return null;

}


/* ======================================================
   RESOLVER CRÃ‰DITO REAL DE LA VISITA
====================================================== */

async function resolveVisitCredit(
  companyId,
  visit,
  route
) {

  if (
    !companyId ||
    !visit
  ) {

    return null;

  }


  const clientId =
    normalizeId(
      visit.clientId
    );


  if (
    !clientId
  ) {

    return null;

  }


  /* ====================================================
     1. CRÃ‰DITO GUARDADO EN LA VISITA
  ==================================================== */

  const visitCreditId =
    normalizeId(
      visit.creditId
    );


  if (
    visitCreditId
  ) {

    const visitCredit =
      await getValidCreditById(

        companyId,

        visitCreditId,

        clientId

      );


    if (
      visitCredit
    ) {

      return visitCredit;

    }

  }


  /* ====================================================
     2. DATOS DE LA RUTA
  ==================================================== */

  const routeDate =
    normalizeDate(
      route?.date
    );


  const routeCreditId =
    normalizeId(
      route?.creditId
    );


  const routeCreditByClient =
    route?.creditByClient &&
    typeof route.creditByClient === "object"
      ? route.creditByClient
      : {};


  /* ====================================================
     3. BUSCAR CRÃ‰DITO CORRECTO
  ==================================================== */

  return await findCreditForVisit(

    companyId,

    clientId,

    routeDate,

    routeCreditId,

    routeCreditByClient

  );

}


/* ======================================================
   CREAR VISITAS
====================================================== */

export async function ensureRouteVisits(
  companyId,
  routeId,
  clientIds
) {

  if (
    !companyId ||
    !routeId
  ) {

    throw new Error(
      "companyId y routeId son obligatorios"
    );

  }


  const uniqueClientIds = [

    ...new Set(

      Array.isArray(
        clientIds
      )

        ? clientIds
            .map(normalizeId)
            .filter(Boolean)

        : []

    )

  ];


  const routeRef =
    getRouteRef(
      companyId,
      routeId
    );


  const routeSnapshot =
    await getDoc(
      routeRef
    );


  if (
    !routeSnapshot.exists()
  ) {

    throw new Error(
      "La ruta no existe"
    );

  }


  const route =
    routeSnapshot.data();


  const routeDate =
    normalizeDate(
      route.date
    );


  const routeCreditId =
    normalizeId(
      route.creditId
    );


  const routeCreditByClient =
    route.creditByClient &&
    typeof route.creditByClient === "object"
      ? route.creditByClient
      : {};


  const visitsRef =
    getVisitsRef(
      companyId,
      routeId
    );


  const snapshot =
    await getDocs(
      visitsRef
    );


  const existingVisits =
    new Map(

      snapshot.docs.map(
        item => [

          item.id,

          {

            id:
              item.id,

            ...item.data()

          }

        ]

      )

    );


  /* ====================================================
     CREAR VISITAS NUEVAS
  ==================================================== */

  await Promise.all(

    uniqueClientIds

      .filter(

        clientId =>

          !existingVisits.has(
            clientId
          )

      )

      .map(

        async clientId => {

          const credit =
            await findCreditForVisit(

              companyId,

              clientId,

              routeDate,

              routeCreditId,

              routeCreditByClient

            );


          await setDoc(

            doc(
              visitsRef,
              clientId
            ),

            {

              clientId,

              creditId:
                credit?.id ||
                null,

              status:
                "Pendiente",

              collectedAmount:
                0,

              paymentId:
                null,

              paymentMethod:
                null,

              notes:
                "",

              visitedAt:
                null,

              createdAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp()

            }

          );

        }

      )

  );


  /* ====================================================
     REPARAR VISITAS SIN CRÃ‰DITO
  ==================================================== */

  const refreshedSnapshot =
    await getDocs(
      visitsRef
    );


  const refreshedVisits =
    refreshedSnapshot.docs.map(
      item => ({

        id:
          item.id,

        ...item.data()

      })
    );


  await Promise.all(

    refreshedVisits

      .filter(

        visit =>

          uniqueClientIds.includes(
            normalizeId(
              visit.clientId
            )
          )

      )

      .map(

        async visit => {

          const savedCredit =
            await getValidCreditById(

              companyId,

              visit.creditId,

              visit.clientId

            );


          const credit =
            savedCredit ||
            await findCreditForVisit(

              companyId,

              visit.clientId,

              routeDate,

              routeCreditId,

              routeCreditByClient

            );


          if (
            !credit ||
            normalizeId(
              visit.creditId
            ) ===
            normalizeId(
              credit.id
            )
          ) {

            return;

          }


          await updateDoc(

            doc(
              visitsRef,
              visit.id
            ),

            {

              creditId:
                credit.id,

              updatedAt:
                serverTimestamp()

            }

          );

        }

      )

  );


  return getRouteVisits(

    companyId,

    routeId

  );

}


/* ======================================================
   OBTENER VISITAS
====================================================== */

export async function getRouteVisits(
  companyId,
  routeId
) {

  const snapshot =
    await getDocs(

      getVisitsRef(
        companyId,
        routeId
      )

    );


  return snapshot.docs.map(
    item => ({

      id:
        item.id,

      ...item.data()

    })
  );

}


/* ======================================================
   REGISTRAR RESULTADO DE VISITA
====================================================== */

export async function registerRouteVisit(
  companyId,
  routeId,
  visitId,
  data
) {

  if (
    !companyId ||
    !routeId ||
    !visitId
  ) {

    throw new Error(
      "companyId, routeId y visitId son obligatorios"
    );

  }


  const status =
    data.status ||
    "Pendiente";


  if (
    !VISIT_STATUSES.includes(
      status
    )
  ) {

    throw new Error(
      "El estado de la visita no es válido"
    );

  }


  const visitRef =
    doc(

      getVisitsRef(
        companyId,
        routeId
      ),

      visitId

    );


  const visitSnapshot =
    await getDoc(
      visitRef
    );


  if (
    !visitSnapshot.exists()
  ) {

    throw new Error(
      "La visita no existe"
    );

  }


  const currentVisit = {

    id:
      visitSnapshot.id,

    ...visitSnapshot.data()

  };


  const value =
    Number(
      data.value || 0
    );


  if (
    value < 0
  ) {

    throw new Error(
      "El valor recaudado no puede ser negativo"
    );

  }


  /* ====================================================
     OBTENER RUTA
  ==================================================== */

  const routeSnapshot =
    await getDoc(

      getRouteRef(
        companyId,
        routeId
      )

    );


  const route =
    routeSnapshot.exists()
      ? {

          id:
            routeSnapshot.id,

          ...routeSnapshot.data()

        }
      : {};


  /* ====================================================
     RESOLVER CRÃ‰DITO REAL
  ==================================================== */

  const resolvedCredit =
    await resolveVisitCredit(

      companyId,

      currentVisit,

      route

    );


  /*
   * ESTE ES EL PUNTO CLAVE.
   *
   * resolvedCredit.id siempre es el ID REAL
   * del documento Firestore porque todas las
   * bÃºsquedas anteriores construyen el crÃ©dito
   * usando snapshot.id.
   */

  const selectedCreditId =
    normalizeId(
      resolvedCredit?.id
    );


  /* ====================================================
     PAGO
  ==================================================== */

  if (
    value > 0 &&
    !selectedCreditId
  ) {

    throw new Error(
      "No se encontró un crédito activo válido para este cliente."
    );

  }


  if (
    value > 0 &&
    currentVisit.paymentId
  ) {

    throw new Error(
      "Esta visita ya tiene un pago registrado."
    );

  }


  let payment =
    null;


  let updatedCredit =
    null;


  let nextRoute =
    null;


  /* ====================================================
     REGISTRAR PAGO
  ==================================================== */

  if (
    value > 0
  ) {

    /*
     * SOLO se envÃ­a el ID REAL DE FIRESTORE.
     */

    const paymentResult =
      await registerCreditPayment(

        companyId,

        selectedCreditId,

        {

          value,

          method:
            data.method ||
            "Efectivo",

          date:
            data.date ||
            normalizeDate(
              route.date
            ),

          client:
            data.clientName ||
            "Cliente",

          clientId:
            currentVisit.clientId,

          routeId,

          visitId,

          source:
            "route"

        }

      );


    payment =
      paymentResult.payment;


    updatedCredit =
      paymentResult.updatedCredit;


    nextRoute =
      paymentResult.updatedRoute ||
      null;

  }


  /* ====================================================
     ACTUALIZAR VISITA
  ==================================================== */

  await updateDoc(

    visitRef,

    {

      status,

      notes:
        data.notes ||
        "",

      collectedAmount:
        value,

      /*
       * Guardamos el ID REAL.
       */

      creditId:
        selectedCreditId ||
        null,

      paymentId:
        payment?.id ||
        null,

      paymentMethod:

        value > 0

          ? data.method ||
            "Efectivo"

          : null,

      visitedAt:

        status ===
        "Pendiente"

          ? null

          : serverTimestamp(),

      updatedAt:
        serverTimestamp()

    }

  );


  /* ====================================================
     ACTUALIZAR RESUMEN DE RUTA
  ==================================================== */

  const updatedRoute =
    await syncRouteSummary(

      companyId,

      routeId

    );


  const updatedVisit =
    await getDoc(
      visitRef
    );


  return {

    visit: {

      id:
        updatedVisit.id,

      ...updatedVisit.data()

    },

    updatedRoute,

    payment,

    updatedCredit,

    nextRoute

  };

}


/* ======================================================
   SINCRONIZAR RESUMEN DE RUTA
====================================================== */

export async function syncRouteSummary(
  companyId,
  routeId
) {

  const routeRef =
    getRouteRef(
      companyId,
      routeId
    );


  const routeSnapshot =
    await getDoc(
      routeRef
    );


  if (
    !routeSnapshot.exists()
  ) {

    throw new Error(
      "La ruta no existe"
    );

  }


  const route =
    routeSnapshot.data();


  const clientIds =
    Array.isArray(
      route.clientIds
    )

      ? route.clientIds
          .map(normalizeId)

      : [];


  const activeClientIds =
    new Set(
      clientIds
    );


  const visits =
    await getRouteVisits(

      companyId,

      routeId

    );


  const activeVisits =
    visits.filter(

      visit =>

        activeClientIds.has(
          normalizeId(
            visit.clientId
          )
        )

    );


  const completedVisits =
    activeVisits.filter(

      visit =>

        visit.status !==
        "Pendiente"

    ).length;


  const collected =
    activeVisits.reduce(

      (
        total,
        visit
      ) =>

        total +

        Number(
          visit.collectedAmount ||
          0
        ),

      0

    );


  const totalVisits =
    clientIds.length;


  const status =

    totalVisits > 0 &&

    completedVisits ===
      totalVisits

      ? "Completada"

      : completedVisits > 0

        ? "En progreso"

        : "Pendiente";


  const summary = {

    totalVisits,

    completedVisits,

    collected,

    status,

    updatedAt:
      serverTimestamp()

  };


  await updateDoc(

    routeRef,

    summary

  );


  return {

    id:
      routeId,

    ...route,

    ...summary

  };

}
