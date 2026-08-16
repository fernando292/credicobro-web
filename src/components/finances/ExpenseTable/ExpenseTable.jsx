import {
  Trash2
} from "lucide-react";

import {
  formatCurrency
} from "../../../utils/currency";

import "./ExpenseTable.css";


function ExpenseTable({

  expenses = [],

  onDelete

}) {

  if (!expenses.length) {

    return (

      <div className="expense-table-empty">

        <h3>
          No hay egresos registrados
        </h3>

        <p>
          Los gastos registrados aparecerán aquí.
        </p>

      </div>

    );

  }


  return (

    <div className="expense-table">

      <table>

        <thead>

          <tr>

            <th>
              Fecha
            </th>

            <th>
              Descripción
            </th>

            <th>
              Categoría
            </th>

            <th>
              Método
            </th>

            <th>
              Valor
            </th>

            <th>
              Acción
            </th>

          </tr>

        </thead>


        <tbody>

          {

            expenses.map(

              expense => (

                <tr
                  key={expense.id}
                >

                  <td>
                    {expense.date || "Sin fecha"}
                  </td>


                  <td>
                    {expense.description || "Sin descripción"}
                  </td>


                  <td>
                    {expense.category || "General"}
                  </td>


                  <td>
                    {expense.method || "Sin método"}
                  </td>


                  <td className="expense-table__amount">

                    {formatCurrency(
                      expense.amount
                    )}

                  </td>


                  <td>

                    <button

                      type="button"

                      className="expense-table__delete"

                      onClick={() =>
                        onDelete &&
                        onDelete(
                          expense.id
                        )
                      }

                      title="Eliminar"

                    >

                      <Trash2
                        size={19}
                      />

                    </button>

                  </td>

                </tr>

              )

            )

          }

        </tbody>

      </table>

    </div>

  );

}


export default ExpenseTable;