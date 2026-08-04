export function calculateCreditSummary(form) {


  const capital = Number(

    form.amount || 0

  );


  const interestPercent = Number(

    form.interest || 0

  );



  const installments = Number(

    form.installments || 1

  );



  const totalInterest =

    capital *

    (interestPercent / 100);



  const total =

    capital +

    totalInterest;



  const installment =

    installments > 0

      ? total / installments

      : 0;




  return {

    capital,

    interest: totalInterest,

    total,

    installment

  };

}