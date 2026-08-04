import "./CreditProgress.css";


function CreditProgress({ credit }) {


  const total = Number(
    credit.installments || 0
  );


  const paid = Number(
    credit.paidInstallments || 0
  );


  const percentage = total > 0
    ? Math.min(
        (paid / total) * 100,
        100
      )
    : 0;



  return (

    <div className="credit-progress">


      <div className="credit-progress__header">

        <span>
          Progreso del crédito
        </span>


        <strong>
          {paid} / {total}
        </strong>


      </div>



      <div className="credit-progress__bar">


        <div

          className="credit-progress__fill"

          style={{
            width:`${percentage}%`
          }}

        />


      </div>




      <small>

        {Math.round(percentage)}% completado

      </small>


    </div>

  );

}


export default CreditProgress;