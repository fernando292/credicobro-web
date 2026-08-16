import "./FinanceChart.css";


function FinanceChart({

  movements = []

}) {

  if (!movements.length) {

    return (

      <div className="finance-chart">

        <div className="finance-chart__header">

          <h3>
            Flujo financiero
          </h3>

          <p>
            No hay movimientos registrados.
          </p>

        </div>


        <div className="finance-chart__empty">

          No hay datos para mostrar.

        </div>

      </div>

    );

  }


  const orderedMovements = [

    ...movements

  ].sort(

    (a, b) =>

      String(a.date || "")
        .localeCompare(
          String(b.date || "")
        )

  );


  const maxValue = Math.max(

    ...orderedMovements.map(

      movement =>

        Number(
          movement.amount ||
          movement.value ||
          0
        )

    ),

    1

  );


  return (

    <div className="finance-chart">

      <div className="finance-chart__header">

        <div>

          <h3>
            Flujo financiero
          </h3>

          <p>
            Ingresos y egresos registrados.
          </p>

        </div>

      </div>


      <div className="finance-chart__content">

        {

          orderedMovements.map(

            (movement, index) => {

              const amount = Number(

                movement.amount ||
                movement.value ||
                0

              );


              const percentage = Math.max(

                (amount / maxValue) * 100,

                4

              );


              const isIncome =

                movement.type === "income";


              return (

                <div

                  key={
                    movement.id ||
                    `${movement.date}-${index}`
                  }

                  className="finance-chart__item"

                >

                  <div className="finance-chart__label">

                    <span>

                      {movement.date || "Sin fecha"}

                    </span>

                    <strong>

                      {isIncome
                        ? "Ingreso"
                        : "Egreso"}

                    </strong>

                  </div>


                  <div className="finance-chart__bar-container">

                    <div

                      className={

                        `finance-chart__bar ${
                          isIncome
                            ? "income"
                            : "expense"
                        }`

                      }

                      style={{

                        width:
                          `${percentage}%`

                      }}

                    />

                  </div>


                  <span className="finance-chart__amount">

                    $

                    {amount.toLocaleString()}

                  </span>

                </div>

              );

            }

          )

        }

      </div>

    </div>

  );

}


export default FinanceChart;