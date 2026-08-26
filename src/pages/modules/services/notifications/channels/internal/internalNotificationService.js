import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  db
} from "../../../../../../config/firebase";


/* =======================================================
   CREAR NOTIFICACIÓN INTERNA
======================================================= */

export async function createInternalNotification({

  companyId,

  title,

  message,

  type = "info",

  module = "general",

  referenceId = null

}) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  if (!title) {

    throw new Error(
      "title es obligatorio."
    );

  }


  if (!message) {

    throw new Error(
      "message es obligatorio."
    );

  }


  try {

    const notificationsRef =
      collection(

        db,

        "notifications"

      );


    const result =
      await addDoc(

        notificationsRef,

        {

          companyId,

          title,

          message,

          type,

          module,

          referenceId,

          read: false,

          createdAt:
            serverTimestamp()

        }

      );


    return result.id;


  } catch (error) {

    console.error(

      "Error creando notificación interna:",

      error

    );


    throw error;

  }

}