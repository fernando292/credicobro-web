import {
  Eye,
  Pencil,
  Trash2
} from "lucide-react";

import {
  formatCurrency
} from "../../../utils/currency";

import "./FinanceTable.css";


function FinanceTable({

  movements = [],

  onView,

  onEdit,

  onDelete

}) {


  /* ======================================================
     ESTADO VACÍO
  ====================================================== */

  if (!movements.length) {

    return (

      <div className="finance-table-empty">

        <h3>
          No hay movimientos registrados
        </h3>

        <p>
          Los ingresos y egresos aparecerán aquí.
        </p>

      </div>

    );

  }


  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <div className="finance-table">

      <table>

        <thead>

          <tr>

            <th>
              Fecha
            </th>

            <th>
              Tipo
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

            movements.map(

              movement => {

                const isIncome =
                  movement.type === "income";


                const amount =
                  Number(
                    movement.amount ||
                    movement.value ||
                    0
                  );


                const movementId =
                  movement.id ||
                  movement.firestoreId ||
                  "";


                return (

                  <tr

                    key={
                      `${movement.type}-${movementId}`
                    }

                  >


                    {/* ==================================
                        FECHA
                    ================================== */}

                    <td>

                      {
                        movement.date ||
                        "Sin fecha"
                      }

                    </td>


                    {/* ==================================
                        TIPO
                    ================================== */}

                    <td>

                      <span

                        className={
                          `finance-table__type ${
                            isIncome
                              ? "income"
                              : "expense"
                          }`
                        }

                      >

                        {
                          isIncome
                            ? "Ingreso"
                            : "Egreso"
                        }

                      </span>

                    </td>


                    {/* ==================================
                        DESCRIPCIÓN
                    ================================== */}

                    <td>

                      {

                        isIncome

                          ? (
                            movement.client ||
                            "Cliente"
                          )

                          : (
                            movement.description ||
                            "Sin descripción"
                          )

                      }

                    </td>


                    {/* ==================================
                        CATEGORÍA
                    ================================== */}

                    <td>

                      {
                        movement.category ||
                        "General"
                      }

                    </td>


                    {/* ==================================
                        MÉTODO
                    ================================== */}

                    <td>

                      {
                        movement.method ||
                        "Sin método"
                      }

                    </td>


                    {/* ==================================
                        VALOR
                    ================================== */}

                    <td

                      className={
                        `finance-table__amount ${
                          isIncome
                            ? "income"
                            : "expense"
                        }`
                      }

                    >

                      {
                        isIncome
                          ? "+"
                          : "-"
                      }

                      {formatCurrency(
                        amount
                      )}

                    </td>


                    {/* ==================================
                        ACCIONES
                    ================================== */}

                    <td>

                      <div className="finance-table__actions">


                        {/* ==============================
                            VER
                        ============================== */}

                        <button

                          type="button"

                          className="finance-table__action finance-table__view"

                          onClick={() => {

                            if (onView) {

                              onView(
                                movement
                              );

                            }

                          }}

                          title="Ver movimiento"

                          aria-label="Ver movimiento"

                        >

                          <Eye
                            size={18}
                          />

                        </button>


                        {/* ==============================
                            EDITAR
                        ============================== */}

                        <button

                          type="button"

                          className="finance-table__action finance-table__edit"

                          onClick={() => {

                            if (onEdit) {

                              onEdit(
                                movement
                              );

                            }

                          }}

                          title="Editar movimiento"

                          aria-label="Editar movimiento"

                        >

                          <Pencil
                            size={18}
                          />

                        </button>


                        {/* ==============================
                            ELIMINAR
                        ============================== */}

                        <button

                          type="button"

                          className="finance-table__action finance-table__delete"

                          onClick={() => {

                            if (onDelete) {

                              onDelete(
                                movement
                              );

                            }

                          }}

                          title="Eliminar movimiento"

                          aria-label="Eliminar movimiento"

                        >

                          <Trash2
                            size={18}
                          />

                        </button>


                      </div>

                    </td>


                  </tr>

                );

              }

            )

          }

        </tbody>

      </table>

    </div>

  );

}


export default FinanceTable;
