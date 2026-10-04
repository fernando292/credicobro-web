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


/* ======================================================
   REFERENCIAS
====================================================== */

function getRoutesRef(
  companyId
) {

  return collection(
    db,
    "companies",
    companyId,
    "routes"
  );

}


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


/* ======================================================
   NORMALIZAR TEXTO
====================================================== */

function normalizeText(
  value
) {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

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
   OBTENER RUTAS
====================================================== */

export async function getRoutes(
  companyId
) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio"
    );

  }

  const routesRef =
    getRoutesRef(
      companyId
    );

  const routesQuery =
    query(
      routesRef,
      orderBy(
        "date",
        "desc"
      )
    );

  const snapshot =
    await getDocs(
      routesQuery
    );

  return snapshot.docs.map(
    route => ({

      id:
        route.id,

      ...route.data()

    })
  );

}


/* ======================================================
   OBTENER RUTA POR ID
====================================================== */

export async function getRouteById(
  companyId,
  routeId
) {

  if (
    !companyId ||
    !routeId
  ) {

    throw new Error(
      "companyId y routeId son obligatorios"
    );

  }

  const routeRef =
    getRouteRef(
      companyId,
      routeId
    );

  const snapshot =
    await getDoc(
      routeRef
    );

  if (!snapshot.exists()) {

    return null;

  }

  return {

    id:
      snapshot.id,

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

  if (!data?.name?.trim()) {

    throw new Error(
      "El nombre de la ruta es obligatorio"
    );

  }

  if (!data?.date) {

    throw new Error(
      "La fecha de la ruta es obligatoria"
    );

  }

  const routesRef =
    getRoutesRef(
      companyId
    );

  const clientIds = [

    ...new Set(

      Array.isArray(
        data.clientIds
      )

        ? data.clientIds
            .map(normalizeId)
            .filter(Boolean)

        : []

    )

  ];


  const creditIds = [

    ...new Set(

      [

        ...(Array.isArray(data.creditIds)
          ? data.creditIds
          : []),

        ...(data.creditId
          ? [data.creditId]
          : [])

      ]

        .map(normalizeId)
        .filter(Boolean)

    )

  ];


  /* ====================================================
     CRÉDITO POR CLIENTE
  ==================================================== */

  const creditByClient = {

    ...(data.creditByClient &&
    typeof data.creditByClient === "object"
      ? data.creditByClient
      : {})

  };


  if (
    clientIds.length === 1 &&
    creditIds.length === 1 &&
    !creditByClient[
      clientIds[0]
    ]
  ) {

    creditByClient[
      clientIds[0]
    ] =
      creditIds[0];

  }


  const routeData = {

    name:
      data.name.trim(),

    city:
      data.city?.trim() || "",

    date:
      normalizeDate(
        data.date
      ),

    zone:
      data.zone?.trim() || "",

    description:
      data.description?.trim() || "",

    status:
      data.status ||
      "Pendiente",

    clientIds,

    creditIds,

    creditId:
      creditIds.length === 1
        ? creditIds[0]
        : null,

    creditByClient,

    completedVisits:
      Number(
        data.completedVisits || 0
      ),

    totalVisits:
      clientIds.length,

    collected:
      Number(
        data.collected || 0
      ),

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp()

  };


  const result =
    await addDoc(
      routesRef,
      routeData
    );


  return {

    id:
      result.id,

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

  if (
    !companyId ||
    !routeId
  ) {

    throw new Error(
      "companyId y routeId son obligatorios"
    );

  }

  const routeRef =
    getRouteRef(
      companyId,
      routeId
    );

  const routeSnapshot =
    await getDoc(
      routeRef
    );

  if (!routeSnapshot.exists()) {

    throw new Error(
      "La ruta no existe"
    );

  }

  const {
    id,
    clientIds,
    totalVisits,
    completedVisits,
    collected,
    status,
    createdAt,
    creditIds,
    creditId,
    creditByClient,
    ...routeData
  } = data || {};


  const cleanData = {

    ...(routeData.name !== undefined && {

      name:
        String(
          routeData.name
        ).trim()

    }),

    ...(routeData.city !== undefined && {

      city:
        String(
          routeData.city
        ).trim()

    }),

    ...(routeData.date !== undefined && {

      date:
        normalizeDate(
          routeData.date
        )

    }),

    ...(routeData.zone !== undefined && {

      zone:
        String(
          routeData.zone
        ).trim()

    }),

    ...(routeData.description !== undefined && {

      description:
        String(
          routeData.description
        ).trim()

    }),

    ...(creditIds !== undefined && {

      creditIds: [

        ...new Set(

          (
            Array.isArray(
              creditIds
            )
              ? creditIds
              : []
          )
            .map(normalizeId)
            .filter(Boolean)

        )

      ]

    }),

    ...(creditId !== undefined && {

      creditId:
        normalizeId(
          creditId
        ) || null

    }),

    ...(creditByClient !== undefined && {

      creditByClient:
        creditByClient &&
        typeof creditByClient === "object"
          ? creditByClient
          : {}

    }),

    updatedAt:
      serverTimestamp()

  };


  await updateDoc(
    routeRef,
    cleanData
  );


  return getRouteById(
    companyId,
    routeId
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

  if (
    !companyId ||
    !routeId
  ) {

    throw new Error(
      "companyId y routeId son obligatorios"
    );

  }

  const routeRef =
    getRouteRef(
      companyId,
      routeId
    );

  const routeSnapshot =
    await getDoc(
      routeRef
    );

  if (!routeSnapshot.exists()) {

    throw new Error(
      "La ruta no existe"
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


  await updateDoc(

    routeRef,

    {

      clientIds:
        uniqueClientIds,

      totalVisits:
        uniqueClientIds.length,

      updatedAt:
        serverTimestamp()

    }

  );


  return {

    clientIds:
      uniqueClientIds,

    totalVisits:
      uniqueClientIds.length

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

  const route =
    await getRouteById(
      companyId,
      routeId
    );

  if (!route) {

    throw new Error(
      "La ruta no existe"
    );

  }

  const currentClientIds =
    Array.isArray(
      route.clientIds
    )

      ? route.clientIds
          .map(normalizeId)
          .filter(Boolean)

      : [];


  const newClientIds =
    Array.isArray(
      clientIds
    )

      ? clientIds
          .map(normalizeId)
          .filter(Boolean)

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

  const route =
    await getRouteById(
      companyId,
      routeId
    );

  if (!route) {

    throw new Error(
      "La ruta no existe"
    );

  }

  const clientsToRemove =
    new Set(

      Array.isArray(
        clientIds
      )

        ? clientIds
            .map(normalizeId)

        : []

    );


  const remainingClientIds = (

    Array.isArray(
      route.clientIds
    )

      ? route.clientIds
          .map(normalizeId)

      : []

  ).filter(

    id =>
      !clientsToRemove.has(
        id
      )

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

  if (
    !companyId ||
    !routeId
  ) {

    throw new Error(
      "companyId y routeId son obligatorios"
    );

  }

  const routeRef =
    getRouteRef(
      companyId,
      routeId
    );

  const routeSnapshot =
    await getDoc(
      routeRef
    );

  if (!routeSnapshot.exists()) {

    throw new Error(
      "La ruta no existe"
    );

  }

  await deleteDoc(
    routeRef
  );

  return true;

}


/* ======================================================
   ELIMINAR CRÉDITO DE RUTAS ASOCIADAS
====================================================== */

export async function removeCreditFromRoutes(
  companyId,
  creditId,
  clientId = null,
  paymentDate = null
) {

  if (
    !companyId ||
    !creditId
  ) {

    return;

  }

  const normalizedCreditId =
    normalizeId(
      creditId
    );

  const normalizedClientId =
    normalizeId(
      clientId
    );

  const normalizedPaymentDate =
    normalizeDate(
      paymentDate
    );


  if (!normalizedCreditId) {

    return;

  }


  const routes =
    await getRoutes(
      companyId
    );


  for (const route of routes) {

    const currentClientIds =
      Array.isArray(
        route.clientIds
      )

        ? route.clientIds
            .map(normalizeId)
            .filter(Boolean)

        : [];


    const currentCreditIds =
      Array.isArray(
        route.creditIds
      )

        ? route.creditIds
            .map(normalizeId)
            .filter(Boolean)

        : [];


    if (
      route.creditId
    ) {

      currentCreditIds.push(
        normalizeId(
          route.creditId
        )
      );

    }


    const uniqueCreditIds = [

      ...new Set(

        currentCreditIds
          .map(normalizeId)
          .filter(Boolean)

      )

    ];


    const currentCreditByClient = {

      ...(route.creditByClient &&
      typeof route.creditByClient === "object"
        ? route.creditByClient
        : {})

    };


    const mappedClients =
      Object.entries(
        currentCreditByClient
      )
        .filter(
          ([, mappedCreditId]) =>
            normalizeId(
              mappedCreditId
            ) ===
            normalizedCreditId
        )
        .map(
          ([mappedClientId]) =>
            normalizeId(
              mappedClientId
            )
        )
        .filter(Boolean);


    const directCreditMatch =
      uniqueCreditIds.includes(
        normalizedCreditId
      ) ||
      mappedClients.length > 0;


    /*
     * Compatibilidad con rutas automáticas
     * antiguas que no guardaron creditId.
     */

    const automaticRoute =
      String(
        route.description || ""
      ).trim() ===
      "Ruta creada automáticamente para cobro.";


    const legacyAutomaticMatch =
      !directCreditMatch &&
      automaticRoute &&
      normalizedClientId &&
      currentClientIds.includes(
        normalizedClientId
      ) &&
      normalizedPaymentDate &&
      normalizeDate(
        route.date
      ) ===
      normalizedPaymentDate;


    if (
      !directCreditMatch &&
      !legacyAutomaticMatch
    ) {

      continue;

    }


    const clientsToRemove =
      new Set(
        mappedClients
      );


    /*
     * Si conocemos el cliente del crédito y
     * la ruta contiene ese cliente, la relación
     * puede retirarse de forma segura.
     */

    if (
      normalizedClientId &&
      currentClientIds.includes(
        normalizedClientId
      ) &&
      directCreditMatch
    ) {

      clientsToRemove.add(
        normalizedClientId
      );

    }


    /*
     * Compatibilidad con rutas automáticas antiguas.
     * Solo se retira el cliente cuando la coincidencia
     * de cliente + fecha es inequívoca.
     */

    if (
      legacyAutomaticMatch &&
      currentClientIds.length === 1
    ) {

      clientsToRemove.add(
        normalizedClientId
      );

    }


    const remainingClientIds =
      currentClientIds.filter(
        id =>
          !clientsToRemove.has(
            id
          )
      );


    const remainingCreditIds =
      uniqueCreditIds.filter(
        id =>
          id !==
          normalizedCreditId
      );


    const remainingCreditByClient = {};


    Object.entries(
      currentCreditByClient
    ).forEach(
      ([mappedClientId, mappedCreditId]) => {

        const normalizedMappedClientId =
          normalizeId(
            mappedClientId
          );

        const normalizedMappedCreditId =
          normalizeId(
            mappedCreditId
          );


        if (
          normalizedMappedCreditId ===
          normalizedCreditId
        ) {

          return;

        }


        if (
          clientsToRemove.has(
            normalizedMappedClientId
          )
        ) {

          return;

        }


        remainingCreditByClient[
          normalizedMappedClientId
        ] =
          normalizedMappedCreditId;

      }
    );


    const routeRef =
      getRouteRef(
        companyId,
        route.id
      );


    /*
     * Si no queda ningún cliente, la ruta
     * pertenecía exclusivamente a este crédito.
     */

    if (
      remainingClientIds.length === 0
    ) {

      await deleteDoc(
        routeRef
      );

      continue;

    }


    const updateData = {

      clientIds:
        remainingClientIds,

      totalVisits:
        remainingClientIds.length,

      creditIds:
        remainingCreditIds,

      creditByClient:
        remainingCreditByClient,

      creditId:
        remainingCreditIds.length === 1
          ? remainingCreditIds[0]
          : null,

      updatedAt:
        serverTimestamp()

    };


    await updateDoc(
      routeRef,
      updateData
    );

  }

}


/* ======================================================
   ASIGNACIÓN AUTOMÁTICA DE CLIENTE A RUTA
====================================================== */

export async function assignClientAutomaticallyToRoute(
  companyId,
  clientId,
  paymentDate,
  creditId = null
) {

  if (
    !companyId ||
    !clientId ||
    !paymentDate
  ) {

    return null;

  }


  const {
    getClientById
  } = await import(
    "../clients/clientService"
  );


  const client =
    await getClientById(
      companyId,
      clientId
    );


  if (!client) {

    console.warn(
      "No se encontró el cliente para crear la ruta automática:",
      clientId
    );

    return null;

  }


  const city =
    String(
      client.city ||
      ""
    ).trim();


  if (!city) {

    console.warn(
      "Cliente sin ciudad. No se puede crear ruta automática:",
      clientId
    );

    return null;

  }


  const normalizedCity =
    normalizeText(
      city
    );


  const normalizedDate =
    normalizeDate(
      paymentDate
    );


  const normalizedClientId =
    normalizeId(
      clientId
    );


  const normalizedCreditId =
    normalizeId(
      creditId
    );


  if (!normalizedDate) {

    return null;

  }


  const routes =
    await getRoutes(
      companyId
    );


  const existingRoute =
    routes.find(
      route => {

        const routeCity =
          normalizeText(
            route.city
          );


        const routeDate =
          normalizeDate(
            route.date
          );


        return (

          routeCity ===
          normalizedCity

          &&

          routeDate ===
          normalizedDate

        );

      }
    );


  /* ====================================================
     RUTA EXISTENTE
  ==================================================== */

  if (existingRoute) {

    const currentClientIds =
      Array.isArray(
        existingRoute.clientIds
      )

        ? existingRoute.clientIds
            .map(normalizeId)
            .filter(Boolean)

        : [];


    const currentCreditIds =
      Array.isArray(
        existingRoute.creditIds
      )

        ? existingRoute.creditIds
            .map(normalizeId)
            .filter(Boolean)

        : [];


    if (
      existingRoute.creditId
    ) {

      currentCreditIds.push(
        normalizeId(
          existingRoute.creditId
        )
      );

    }


    const updatedClientIds = [

      ...new Set([

        ...currentClientIds,

        normalizedClientId

      ])

    ];


    const updatedCreditIds = [

      ...new Set(

        [

          ...currentCreditIds,

          ...(normalizedCreditId
            ? [normalizedCreditId]
            : [])

        ]

          .map(normalizeId)
          .filter(Boolean)

      )

    ];


    /* ==================================================
       MAPA CLIENTE → CRÉDITO
    ================================================== */

    const currentCreditByClient = {

      ...(existingRoute.creditByClient &&
      typeof existingRoute.creditByClient === "object"
        ? existingRoute.creditByClient
        : {})

    };


    /*
     * Cuando conocemos el crédito,
     * queda asociado directamente al cliente.
     */

    if (
      normalizedCreditId
    ) {

      currentCreditByClient[
        normalizedClientId
      ] =
        normalizedCreditId;

    }


    /*
     * Compatibilidad con rutas antiguas.
     */

    if (
      !currentCreditByClient[
        normalizedClientId
      ] &&

      updatedCreditIds.length === 1
    ) {

      currentCreditByClient[
        normalizedClientId
      ] =
        updatedCreditIds[0];

    }


    const updateData = {

      clientIds:
        updatedClientIds,

      totalVisits:
        updatedClientIds.length,

      creditIds:
        updatedCreditIds,

      creditByClient:
        currentCreditByClient,

      updatedAt:
        serverTimestamp()

    };


    /*
     * Solo usamos creditId global cuando
     * existe un único crédito en la ruta.
     */

    if (
      updatedCreditIds.length === 1
    ) {

      updateData.creditId =
        updatedCreditIds[0];

    } else {

      updateData.creditId =
        null;

    }


    await updateDoc(

      getRouteRef(
        companyId,
        existingRoute.id
      ),

      updateData

    );


    return getRouteById(

      companyId,

      existingRoute.id

    );

  }


  /* ====================================================
     CREAR NUEVA RUTA
  ==================================================== */

  const newRoute =
    await createRoute(

      companyId,

      {

        name:
          `Ruta ${city} - ${normalizedDate}`,

        city:
          city,

        date:
          normalizedDate,

        zone:
          "",

        description:
          "Ruta creada automáticamente para cobro.",

        status:
          "Pendiente",

        clientIds:
          [

            normalizedClientId

          ],

        creditIds:
          normalizedCreditId
            ? [normalizedCreditId]
            : [],

        creditId:
          normalizedCreditId ||
          null,

        creditByClient:
          normalizedCreditId

            ? {

                [normalizedClientId]:
                  normalizedCreditId

              }

            : {},

        completedVisits:
          0,

        totalVisits:
          1,

        collected:
          0

      }

    );


  return newRoute;

}