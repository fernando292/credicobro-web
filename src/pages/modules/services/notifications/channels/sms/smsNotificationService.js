
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";

import {
  db
} from "../../../../../../config/firebase";


/* =======================================================
   SERVICIO DE NOTIFICACIONES SMS

   Este servicio no envía directamente el SMS.

   Su responsabilidad es crear una solicitud en:

   companies/{companyId}/smsQueue

   El Android CrediCobro SMS se encarga posteriormente
   de detectar la solicitud y enviarla mediante la SIM.
======================================================= */


/* =======================================================
   ESTADO DEL CANAL
======================================================= */

export function isSmsConfigured() {

  return true;

}


/* =======================================================
   VERIFICAR SMS DUPLICADO
======================================================= */

async function smsEventAlreadyQueued({
  smsQueueRef,
  type,
  referenceId
}) {

  const duplicateQuery =
    query(
      smsQueueRef,
      where(
        "type",
        "==",
        type
      ),
      where(
        "referenceId",
        "==",
        referenceId
      )
    );

  const snapshot =
    await getDocs(
      duplicateQuery
    );

  return !snapshot.empty;

}


/* =======================================================
   CREAR SOLICITUD SMS
======================================================= */

export async function sendSmsNotification({

  companyId,

  phone,

  message,

  type = "info",

  referenceId = null

}) {

  if (!companyId) {

    throw new Error(
      "companyId es obligatorio."
    );

  }


  if (!phone) {

    throw new Error(
      "El número de teléfono es obligatorio."
    );

  }


  if (!message) {

    throw new Error(
      "El mensaje SMS es obligatorio."
    );

  }


  try {

    const smsQueueRef =
      collection(

        db,

        "companies",

        companyId,

        "smsQueue"

      );


    /* ==================================================
       EVITAR SMS DUPLICADO
    ================================================== */

    if (
      referenceId
    ) {

      const alreadyQueued =
        await smsEventAlreadyQueued({

          smsQueueRef,

          type,

          referenceId

        });


      if (
        alreadyQueued
      ) {

        console.log(
          "SMS duplicado evitado:",
          {
            companyId,
            type,
            referenceId
          }
        );


        return {

          success:
            true,

          status:
            "already_queued",

          channel:
            "sms",

          companyId,

          phone,

          type,

          referenceId,

          smsId:
            null

        };

      }

    }


    const result =
      await addDoc(

        smsQueueRef,

        {

          phone,

          message,

          status:
            "pending",

          type,

          referenceId,

          createdAt:
            serverTimestamp()

        }

      );


    console.log(
      "SMS agregado a smsQueue:",
      {

        smsId:
          result.id,

        companyId,

        phone,

        type,

        referenceId

      }
    );


    return {

      success:
        true,

      status:
        "queued",

      channel:
        "sms",

      companyId,

      phone,

      type,

      referenceId,

      smsId:
        result.id

    };


  } catch (error) {

    console.error(
      "Error agregando SMS a smsQueue:",
      error
    );


    return {

      success:
        false,

      status:
        "queue_error",

      channel:
        "sms",

      companyId,

      phone,

      type,

      referenceId,

      error:
        error?.message ||
        "No se pudo crear la solicitud SMS."

    };

  }

}

