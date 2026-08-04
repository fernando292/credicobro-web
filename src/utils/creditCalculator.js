export function calculateCredit({

  amount,

  interest,

  installments

}) {

  const capital = Number(amount) || 0;

  const interestPercent = Number(interest) || 0;

  const totalInterest =
    capital * (interestPercent / 100);

  const totalToPay =
    capital + totalInterest;

  const installmentValue =
    installments > 0
      ? totalToPay / installments
      : 0;

  return {

    capital,

    interest: totalInterest,

    total: totalToPay,

    installment: installmentValue

  };

}