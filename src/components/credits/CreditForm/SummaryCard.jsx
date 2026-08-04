import { formatCurrency } from "../../../utils/currency";

import "./SummaryCard.css";

function SummaryCard({ summary }) {

  return (

    <div className="credit-summary">

      <h3>
        Resumen del crédito
      </h3>

      <div className="credit-summary__item">

        <span>
          Capital
        </span>

        <strong>
          {formatCurrency(summary.capital)}
        </strong>

      </div>

      <div className="credit-summary__item">

        <span>
          Interés
        </span>

        <strong>
          {formatCurrency(summary.interest)}
        </strong>

      </div>

      <div className="credit-summary__item">

        <span>
          Total a pagar
        </span>

        <strong>
          {formatCurrency(summary.total)}
        </strong>

      </div>

      <div className="credit-summary__divider"></div>

      <div className="credit-summary__item total">

        <span>
          Valor por cuota
        </span>

        <strong>
          {formatCurrency(summary.installment)}
        </strong>

      </div>

    </div>

  );

}

export default SummaryCard;