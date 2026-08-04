import { useMemo, useState } from "react";

import "./PaymentTable.css";

function PaymentTable({ payments }) {

  const [search, setSearch] = useState("");

  const filteredPayments = useMemo(() => {

    if (!search.trim()) return payments;

    const value = search.toLowerCase();

    return payments.filter((payment) => {

      const client = String(payment.client || "").toLowerCase();

      const method = String(payment.method || "").toLowerCase();

      const date = String(payment.date || "").toLowerCase();

      const installment = String(
        payment.installmentNumber || ""
      ).toLowerCase();

      return (
        client.includes(value) ||
        method.includes(value) ||
        date.includes(value) ||
        installment.includes(value)
      );

    });

  }, [payments, search]);

  return (

    <div className="payment-table">

      <div className="payment-table__header">

        <div>

          <h3>Historial de pagos</h3>

          <span>
            {filteredPayments.length} registros
          </span>

        </div>

        <input
          type="text"
          placeholder="Buscar cliente, método o fecha..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="payment-search"
        />

      </div>

      {filteredPayments.length === 0 ? (

        <div className="payment-empty">
          No se encontraron pagos.
        </div>

      ) : (

        <div className="payment-table__container">

          <table>

            <thead>

              <tr>

                <th>Fecha</th>

                <th>Cliente</th>

                <th>Crédito</th>

                <th>Cuota</th>

                <th>Método</th>

                <th>Valor</th>

              </tr>

            </thead>

            <tbody>

              {filteredPayments.map((payment) => (

                <tr key={payment.id}>

                  <td>{payment.date || "-"}</td>

                  <td>{payment.client || "Sin cliente"}</td>

                  <td>
                    $
                    {Number(
                      payment.creditAmount || 0
                    ).toLocaleString()}
                  </td>

                  <td>
                    {payment.installmentNumber
                      ? `#${payment.installmentNumber}`
                      : "-"}
                  </td>

                  <td>

                    <span className="payment-method">

                      {payment.method}

                    </span>

                  </td>

                  <td className="payment-value">

                    $
                    {Number(
                      payment.value || 0
                    ).toLocaleString()}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}

export default PaymentTable;