import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy
} from "firebase/firestore";

import {
  db
} from "../../../../config/firebase";

import {
  sendNotification
} from "./dispatcher/notificationDispatcher";


/* ======================================================
   CREAR NOTIFICACIÓN
====================================================== */

export async function createNotification({

  companyId,

  title,

  message,

  type = "info",

  module = "general",

  referenceId = null,

  channels = ["internal"],

  phone = null

}) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }

  if (!title) {

    throw new Error(
      "El título de la notificación es obligatorio."
    );

  }

  if (!message) {

    throw new Error(
      "El mensaje de la notificación es obligatorio."
    );

  }


  /*
   * Normalizamos los canales para evitar
   * valores duplicados o inválidos.
   */

  const allowedChannels = [
    "internal",
    "sms",
    "email",
    "whatsapp"
  ];


  const normalizedChannels =
    Array.from(
      new Set(
        (
          Array.isArray(channels)
            ? channels
            : ["internal"]
        )
          .map(channel =>
            String(channel)
              .trim()
              .toLowerCase()
          )
          .filter(
            channel =>
              allowedChannels.includes(
                channel
              )
          )
      )
    );


  /*
   * Internal siempre debe existir.
   *
   * Esto garantiza que una notificación
   * importante nunca desaparezca del
   * sistema aunque no haya canales externos.
   */

  if (
    !normalizedChannels.includes(
      "internal"
    )
  ) {

    normalizedChannels.unshift(
      "internal"
    );

  }


  return await sendNotification({

    companyId,

    title,

    message,

    type,

    module,

    referenceId,

    channels:
      normalizedChannels,

    phone

  });

}


/* ======================================================
   OBTENER NOTIFICACIONES
====================================================== */

export async function getNotifications(
  companyId
) {

  try {

    if (!companyId) {

      throw new Error(
        "companyId es obligatorio."
      );

    }


    const notificationsRef =
      collection(
        db,
        "notifications"
      );


    const notificationsQuery =
      query(

        notificationsRef,

        where(
          "companyId",
          "==",
          companyId
        ),

        orderBy(
          "createdAt",
          "desc"
        )

      );


    const snapshot =
      await getDocs(
        notificationsQuery
      );


    return snapshot.docs.map(
      item => ({

        id:
          item.id,

        ...item.data()

      })
    );


  } catch (error) {

    console.error(
      "Error obteniendo notificaciones:",
      error
    );


    return [];

  }

}


/* ======================================================
   MARCAR UNA NOTIFICACIÓN COMO LEÍDA
====================================================== */

export async function markNotificationAsRead(
  notificationId
) {

  try {

    if (!notificationId) {

      throw new Error(
        "notificationId es obligatorio."
      );

    }


    const notificationRef =
      doc(

        db,

        "notifications",

        notificationId

      );


    await updateDoc(

      notificationRef,

      {

        read:
          true

      }

    );


    return true;


  } catch (error) {

    console.error(
      "Error actualizando notificación:",
      error
    );


    return false;

  }

}


/* ======================================================
   MARCAR TODAS COMO LEÍDAS
====================================================== */

export async function markAllNotificationsAsRead(
  companyId
) {

  try {

    if (!companyId) {

      throw new Error(
        "companyId es obligatorio."
      );

    }


    const notifications =
      await getNotifications(
        companyId
      );


    const unreadNotifications =
      notifications.filter(
        item =>
          !item.read
      );


    await Promise.all(

      unreadNotifications.map(
        item =>
          markNotificationAsRead(
            item.id
          )
      )

    );


    return true;


  } catch (error) {

    console.error(
      "Error marcando notificaciones:",
      error
    );


    return false;

  }

}


/* ======================================================
   ELIMINAR NOTIFICACIÓN
====================================================== */

export async function deleteNotification(
  notificationId
) {

  try {

    if (!notificationId) {

      throw new Error(
        "notificationId es obligatorio."
      );

    }


    const notificationRef =
      doc(

        db,

        "notifications",

        notificationId

      );


    await deleteDoc(
      notificationRef
    );


    return true;


  } catch (error) {

    console.error(
      "Error eliminando notificación:",
      error
    );


    return false;

  }

}


/* ======================================================
   LIMPIAR HISTORIAL DE NOTIFICACIONES
====================================================== */

export async function clearNotifications(
  companyId
) {

  try {

    if (!companyId) {

      throw new Error(
        "companyId es obligatorio."
      );

    }


    const notifications =
      await getNotifications(
        companyId
      );


    await Promise.all(

      notifications.map(
        notification =>
          deleteNotification(
            notification.id
          )
      )

    );


    return true;


  } catch (error) {

    console.error(
      "Error limpiando historial:",
      error
    );


    return false;

  }

}