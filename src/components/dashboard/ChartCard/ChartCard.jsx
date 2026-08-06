import PaymentEvolutionChart from "../../charts/PaymentEvolutionChart/PaymentEvolutionChart";

import "./ChartCard.css";


function ChartCard({

  payments = []

}) {


  return (

    <div className="chart-card">


      <div className="chart-card__header">


        <div>

          <h3>

            Evolución de pagos

          </h3>


          <p>

            Comportamiento mensual de los cobros

          </p>


        </div>


        <span>

          2026

        </span>


      </div>





      <div className="chart-card__body">


        {

          payments.length > 0 ? (


            <PaymentEvolutionChart

              payments={payments}

            />


          ) : (


            <p className="chart-empty">

              No hay pagos registrados todavía.

            </p>


          )


        }


      </div>


    </div>

  );

}


export default ChartCard;