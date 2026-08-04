import "./ReportCards.css";


function ReportCards({

  credits

}) {



  const activeCredits = credits.filter(

    credit =>

      credit.status === "Activo"

  ).length;



  const totalBorrowed = credits.reduce(

    (total,credit)=>

      total +

      Number(

        credit.amount || 0

      ),

    0

  );



  const pendingBalance = credits.reduce(

    (total,credit)=>

      total +

      Number(

        credit.balance || 0

      ),

    0

  );



  const totalPaid = credits.reduce(

    (total,credit)=>

      total +

      (

        Number(credit.total || 0)

        -

        Number(credit.balance || 0)

      ),

    0

  );





  return (


    <div className="report-cards">



      <div className="report-card">


        <span>

          Créditos activos

        </span>


        <strong>

          {activeCredits}

        </strong>


        <small>

          créditos en cartera

        </small>


      </div>





      <div className="report-card">


        <span>

          Capital colocado

        </span>


        <strong>

          $

          {totalBorrowed.toLocaleString()}

        </strong>


        <small>

          dinero entregado

        </small>


      </div>





      <div className="report-card">


        <span>

          Saldo pendiente

        </span>


        <strong className="danger">

          $

          {pendingBalance.toLocaleString()}

        </strong>


        <small>

          por recuperar

        </small>


      </div>





      <div className="report-card">


        <span>

          Total recuperado

        </span>


        <strong className="success">

          $

          {totalPaid.toLocaleString()}

        </strong>


        <small>

          pagos recibidos

        </small>


      </div>



    </div>


  );

}


export default ReportCards;