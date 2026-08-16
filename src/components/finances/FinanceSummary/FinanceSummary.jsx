import {
  formatCurrency
} from "../../../utils/currency";

import "./FinanceSummary.css";


function FinanceSummary({

  totalIncome = 0,

  totalExpenses = 0,

  netFlow = 0,

  movements = []

}) {

  return (

    <div className="finance-summary">


      <div className="finance-summary__card">

        <span>
          Ingresos
        </span>

        <strong>
          {formatCurrency(
            totalIncome
          )}
        </strong>

      </div>


      <div className="finance-summary__card">

        <span>
          Egresos
        </span>

        <strong>
          {formatCurrency(
            totalExpenses
          )}
        </strong>

      </div>


      <div className="finance-summary__card">

        <span>
          Flujo neto
        </span>

        <strong>
          {formatCurrency(
            netFlow
          )}
        </strong>

      </div>


      <div className="finance-summary__card">

        <span>
          Movimientos
        </span>

        <strong>
          {movements.length}
        </strong>

      </div>


    </div>

  );

}


export default FinanceSummary;