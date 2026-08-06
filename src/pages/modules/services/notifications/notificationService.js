import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../../../../config/firebase";



/* =======================================================
   Crear notificación
======================================================= */

export async function createNotification({

  companyId,

  title,

  message,

  type = "info",

  module = "general",

  referenceId = null

}) {

  try {

    const notificationsRef = collection(

      db,

      "notifications"

    );

    const result = await addDoc(

      notificationsRef,

      {

        companyId,

        title,

        message,

        type,

        module,

        referenceId,

        read: false,

        createdAt: serverTimestamp()

      }

    );

    return result.id;

  } catch (error) {

    console.error(

      "Error creando notificación",

      error

    );

    return null;

  }

}



/* =======================================================
   Obtener notificaciones
======================================================= */

export async function getNotifications(

  companyId

) {

  try {

    const notificationsRef = collection(

      db,

      "notifications"

    );

    const notificationsQuery = query(

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

    const snapshot = await getDocs(

      notificationsQuery

    );

    return snapshot.docs.map(item => ({

      id: item.id,

      ...item.data()

    }));

  } catch (error) {

    console.error(

      "Error obteniendo notificaciones",

      error

    );

    return [];

  }

}



/* =======================================================
   Marcar una notificación como leída
======================================================= */

export async function markNotificationAsRead(

  notificationId

) {

  try {

    const notificationRef = doc(

      db,

      "notifications",

      notificationId

    );

    await updateDoc(

      notificationRef,

      {

        read: true

      }

    );

  } catch (error) {

    console.error(

      "Error actualizando notificación",

      error

    );

  }

}



/* =======================================================
   Marcar todas como leídas
======================================================= */

export async function markAllNotificationsAsRead(

  companyId

) {

  try {

    const notifications = await getNotifications(

      companyId

    );

    const unreadNotifications = notifications.filter(

      item => !item.read

    );

    await Promise.all(

      unreadNotifications.map(item =>

        markNotificationAsRead(item.id)

      )

    );

  } catch (error) {

    console.error(

      "Error marcando notificaciones",

      error

    );

  }

}



/* =======================================================
   Eliminar notificación
======================================================= */

export async function deleteNotification(

  notificationId

) {

  try {

    const notificationRef = doc(

      db,

      "notifications",

      notificationId

    );

    await deleteDoc(

      notificationRef

    );

  } catch (error) {

    console.error(

      "Error eliminando notificación",

      error

    );

  }

}