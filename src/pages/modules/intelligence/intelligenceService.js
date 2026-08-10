/* ======================================================
   INTELLIGENCE SERVICE
   Motor de inteligencia de cobranza
====================================================== */


/*
  Aquí construiremos las funciones que calcularán:

  - prioridad de cobranza
  - nivel de riesgo
  - comportamiento de pago
  - oportunidad de recuperación
  - recomendación de acción
*/


export function calculateCollectionPriority(
  credit
) {

  const balance =
    Number(
      credit?.balance || 0
    );


  const daysOverdue =
    Number(
      credit?.daysOverdue || 0
    );


  let score = 0;


  if (balance > 0) {
    score += 20;
  }


  if (daysOverdue > 0) {
    score += 30;
  }


  if (daysOverdue >= 7) {
    score += 20;
  }


  if (daysOverdue >= 30) {
    score += 30;
  }


  return Math.min(
    score,
    100
  );

}