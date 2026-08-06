import {
  CalendarDays,
  AlertTriangle,
  Wallet
} from "lucide-react";

import "./DailySummary.css";


function DailySummary({ summary = {} }) {


  return (

    <div className="daily-summary">


      <div className="daily-summary__card">

        <div className="daily-summary__icon green">

          <Wallet size={22}/>

        </div>


        <div>

          <span>

            Cobrado hoy

          </span>


          <h3>

            ${Number(
              summary.recoveredToday || 0
            ).toLocaleString()}

          </h3>

        </div>


      </div>





      <div className="daily-summary__card">

        <div className="daily-summary__icon blue">

          <CalendarDays size={22}/>

        </div>


        <div>

          <span>

            Pagos del día

          </span>


          <h3>

            {summary.paymentsToday || 0}

          </h3>

        </div>


      </div>





      <div className="daily-summary__card">


        <div className="daily-summary__icon orange">

          <AlertTriangle size={22}/>

        </div>


        <div>

          <span>

            Créditos vencidos

          </span>


          <h3>

            {summary.overdueCredits || 0}

          </h3>

        </div>


      </div>



    </div>

  );

}


export default DailySummary;