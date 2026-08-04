import "./PaymentStats.css";


function PaymentStats({

  totalCollected,

  payments,

  credits

}) {


  const totalPayments = payments.length;



  const today = new Date()

    .toISOString()

    .split("T")[0];



  const todayPayments = payments.filter(

    payment =>

      payment.date === today

  ).length;




  const activeCredits = credits.filter(

    credit =>

      credit.status === "Activo"

  ).length;





  const capitalPrestado = credits.reduce(

    (total,credit)=>

      total +

      Number(

        credit.amount || 0

      ),

    0

  );





  const saldoPendiente = credits.reduce(

    (total,credit)=>

      total +

      Number(

        credit.balance || 0

      ),

    0

  );






  return (

    <div className="payment-stats">



      <div className="payment-stat-card">

        <span>
          Créditos activos
        </span>

        <strong>
          {activeCredits}
        </strong>

      </div>





      <div className="payment-stat-card">

        <span>
          Capital prestado
        </span>

        <strong>

          $

          {capitalPrestado.toLocaleString()}

        </strong>

      </div>






      <div className="payment-stat-card">

        <span>
          Saldo pendiente
        </span>


        <strong>

          $

          {saldoPendiente.toLocaleString()}

        </strong>


      </div>






      <div className="payment-stat-card">

        <span>
          Total pagado
        </span>


        <strong>

          $

          {Number(

            totalCollected || 0

          ).toLocaleString()}

        </strong>


      </div>






      <div className="payment-stat-card">

        <span>
          Pagos registrados
        </span>


        <strong>

          {totalPayments}

        </strong>


      </div>





      <div className="payment-stat-card">

        <span>
          Pagos de hoy
        </span>


        <strong>

          {todayPayments}

        </strong>


      </div>



    </div>

  );

}


export default PaymentStats;