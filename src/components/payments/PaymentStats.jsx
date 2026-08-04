import "./PaymentStats.css";


function PaymentStats({

  totalCollected,

  payments

}) {


  const totalPayments = payments.length;


  const today = new Date()
    .toISOString()
    .split("T")[0];


  const todayPayments = payments.filter(

    payment =>

      payment.date === today

  ).length;




  return (

    <div className="payment-stats">


      <div className="payment-stat-card">

        <span>
          Total recaudado
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