import "./CreditSummary.css";

import CreditProgress from "./CreditProgress";

function CreditSummary({ credit }) {

  return (

    <div className="credit-stats">

      <CreditProgress
        credit={credit}
      />

      <div className="summary-card">

        <span>
          Cliente
        </span>

        <strong>
          {credit.client || "Sin cliente"}
        </strong>

      </div>

      <div className="summary-card">

        <span>
          Capital
        </span>

        <strong>
          $
          {Number(
            credit.amount || 0
          ).toLocaleString()}
        </strong>

      </div>

      <div className="summary-card">

        <span>
          Interés
        </span>

        <strong>
          $
          {Number(
            credit.totalInterest || 0
          ).toLocaleString()}
        </strong>

      </div>

      <div className="summary-card">

        <span>
          Total a pagar
        </span>

        <strong>
          $
          {Number(
            credit.total || 0
          ).toLocaleString()}
        </strong>

      </div>

      <div className="summary-card">

        <span>
          Valor por cuota
        </span>

        <strong>
          $
          {Number(
            credit.installmentValue || 0
          ).toLocaleString()}
        </strong>

      </div>

      <div className="summary-card">

        <span>
          Cuotas
        </span>

        <strong>
          {credit.installments || 0}
        </strong>

      </div>

      <div className="summary-card">

        <span>
          Frecuencia
        </span>

        <strong>
          {credit.frequency || "-"}
        </strong>

      </div>

      <div className="summary-card">

        <span>
          Estado
        </span>

        <strong>
          {credit.status || "-"}
        </strong>

      </div>

    </div>

  );

}

export default CreditSummary;