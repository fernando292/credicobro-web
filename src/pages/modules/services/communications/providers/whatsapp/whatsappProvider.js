/* ======================================================
   PROVEEDOR PROPIO DE WHATSAPP

   CrediCobro
   ------------------------------------------------------

   Este archivo representa la CAPA DE TRANSPORTE de
   WhatsApp.

   IMPORTANTE:

   - No depende de Evolution API.
   - No depende de WhatsApp Business API.
   - No contiene lógica de créditos.
   - No contiene lógica de pagos.
   - No contiene lógica de cobranza.
   - No contiene lógica de notificaciones.

   El resto del sistema solamente conoce:

      sendWhatsAppMessage()

   En el futuro podremos implementar aquí:

      1. Transporte propio/local.
      2. WhatsApp Business oficial.
      3. Otro transporte compatible.

   Sin modificar:

      créditos
      pagos
      cobranza
      rutas
      notificaciones
      dispatcher
      gateway

====================================================== */


/* ======================================================
   CONFIGURACIÓN
====================================================== */

/*
   Transporte actualmente utilizado.

   Por ahora:

      "none"

   Más adelante podremos utilizar:

      "local"
      "business"
      "custom"

   La arquitectura queda preparada para cambiarlo
   sin modificar el resto del sistema.
*/

const WHATSAPP_TRANSPORT =
  "none";


/* ======================================================
   ESTADO DEL PROVEEDOR
====================================================== */

export function isWhatsAppProviderReady() {

  return (
    WHATSAPP_TRANSPORT !==
    "none"
  );

}


/* ======================================================
   OBTENER TRANSPORTE ACTUAL
====================================================== */

export function getWhatsAppTransport() {

  return WHATSAPP_TRANSPORT;

}


/* ======================================================
   NORMALIZAR TELÉFONO
====================================================== */

export function normalizeWhatsAppPhone(
  phone
) {

  if (!phone) {

    return null;

  }


  const normalized =
    String(phone)
      .replace(/\D/g, "");


  if (!normalized) {

    return null;

  }


  /*
     Colombia:

     Si llega:

        3234716754

     lo convertimos internamente a:

        573234716754

     Si ya llega con código de país:

        573234716754

     se conserva.

     Esto nos permite mantener los números de
     clientes guardados actualmente en Colombia
     sin obligar al resto del sistema a conocer
     el código internacional.
  */

  if (
    normalized.length === 10 &&
    normalized.startsWith("3")
  ) {

    return `57${normalized}`;

  }


  return normalized;

}


/* ======================================================
   VALIDAR TELÉFONO
====================================================== */

function isValidWhatsAppPhone(
  phone
) {

  if (!phone) {

    return false;

  }


  /*
     Un número internacional normalmente tendrá
     entre 10 y 15 dígitos.

     No estamos validando aquí si el número
     realmente tiene WhatsApp.

     Eso corresponde al transporte real.
  */

  return (
    /^\d{10,15}$/.test(
      phone
    )
  );

}


/* ======================================================
   ENVIAR MENSAJE
====================================================== */

export async function sendWhatsAppMessage({

  phone,

  message

}) {

  /* ====================================================
     NORMALIZAR
  ==================================================== */

  const normalizedPhone =
    normalizeWhatsAppPhone(
      phone
    );


  /* ====================================================
     VALIDAR TELÉFONO
  ==================================================== */

  if (
    !isValidWhatsAppPhone(
      normalizedPhone
    )
  ) {

    return {

      success:
        false,

      status:
        "invalid_phone",

      channel:
        "whatsapp",

      phone:
        normalizedPhone || null,

      error:
        "El número de WhatsApp no es válido."

    };

  }


  /* ====================================================
     VALIDAR MENSAJE
  ==================================================== */

  if (
    !message ||
    typeof message !==
      "string"
  ) {

    return {

      success:
        false,

      status:
        "invalid_message",

      channel:
        "whatsapp",

      phone:
        normalizedPhone,

      error:
        "El mensaje de WhatsApp es obligatorio."

    };

  }


  /* ====================================================
     TRANSPORTE NO CONFIGURADO
  ==================================================== */

  if (
    WHATSAPP_TRANSPORT ===
    "none"
  ) {

    /*
       IMPORTANTE:

       No lanzamos Error.

       Esto evita que la consola muestre errores
       innecesarios mientras el transporte real
       todavía no está implementado.

       La operación simplemente informa:

          not_configured
    */

    return {

      success:
        false,

      status:
        "not_configured",

      channel:
        "whatsapp",

      transport:
        "none",

      phone:
        normalizedPhone,

      message

    };

  }


  /* ====================================================
     TRANSPORTE LOCAL
  ==================================================== */

  if (
    WHATSAPP_TRANSPORT ===
    "local"
  ) {

    /*
       AQUÍ construiremos posteriormente nuestro
       sistema propio de WhatsApp.

       Ejemplo futuro:

          conectar dispositivo
          administrar sesión
          enviar mensaje
          confirmar entrega
          registrar estado

       Sin modificar ningún módulo de negocio.
    */

    console.log(
      "WHATSAPP TRANSPORT LOCAL",
      {

        phone:
          normalizedPhone,

        message

      }
    );


    return {

      success:
        false,

      status:
        "transport_not_implemented",

      channel:
        "whatsapp",

      transport:
        "local",

      phone:
        normalizedPhone

    };

  }


  /* ====================================================
     WHATSAPP BUSINESS OFICIAL
  ==================================================== */

  if (
    WHATSAPP_TRANSPORT ===
    "business"
  ) {

    /*
       FUTURO:

       Aquí podremos implementar la conexión oficial
       con WhatsApp Business.

       El resto de CrediCobro no tendrá que cambiar.
    */

    return {

      success:
        false,

      status:
        "transport_not_implemented",

      channel:
        "whatsapp",

      transport:
        "business",

      phone:
        normalizedPhone

    };

  }


  /* ====================================================
     TRANSPORTE DESCONOCIDO
  ==================================================== */

  return {

    success:
      false,

    status:
      "unsupported_transport",

    channel:
      "whatsapp",

    transport:
      WHATSAPP_TRANSPORT,

    phone:
      normalizedPhone,

    error:
      `Transporte de WhatsApp no soportado: ${WHATSAPP_TRANSPORT}`

  };

}