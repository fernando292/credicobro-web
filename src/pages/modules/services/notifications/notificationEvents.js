/* ======================================================
   COMPATIBILIDAD DE EVENTOS DE NOTIFICACIONES
====================================================== */

/*
 * Este archivo mantiene compatibilidad con cualquier parte
 * antigua del proyecto que todavía importe funciones desde
 * notificationEvents.js.
 *
 * La lógica real de las notificaciones vive únicamente en:
 *
 * notificationEngine.js
 *
 * NO agregar lógica de notificaciones aquí.
 */


export {
  notifyCreditCreated,
  notifyPaymentRegistered,
  notifyClientOverdue,
  notifyTodayCollection,
  notifyFollowUp
} from "./notificationEngine";