import "./ClientFinancialSummary.css";


function ClientFinancialSummary({

  summary

}) {


  if(!summary){

    return null;

  }



  return (

    <div className="client-financial-summary">


      <h3>
        Resumen financiero
      </h3>



      <div className="financial-grid">



        <div className="financial-card active">

          <span>
            Créditos activos
          </span>


          <strong>
            {summary.activeCredits}
          </strong>

        </div>





        <div className="financial-card">

          <span>
            Capital prestado
          </span>


          <strong>
            $
            {Number(
              summary.totalBorrowed || 0
            ).toLocaleString()}
          </strong>

        </div>






        <div className="financial-card warning">

          <span>
            Saldo pendiente
          </span>


          <strong>
            $
            {Number(
              summary.pendingBalance || 0
            ).toLocaleString()}
          </strong>

        </div>






        <div className="financial-card success">

          <span>
            Total pagado
          </span>


          <strong>
            $
            {Number(
              summary.totalPaid || 0
            ).toLocaleString()}
          </strong>

        </div>




      </div>



    </div>

  );

}


export default ClientFinancialSummary;