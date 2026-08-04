import { formatCurrency } from "../../../utils/currency";

import "./PaymentTable.css";


function PaymentTable({ payments = [] }) {


  return (

    <div className="payment-table">


      <div className="payment-table__header">

        <h3>
          Historial de pagos
        </h3>


        <span>
          {payments.length} pagos
        </span>


      </div>





      {
        payments.length === 0 ? (


          <div className="payment-empty">

            No hay pagos registrados todavía.


          </div>



        ) : (



          <table>


            <thead>

              <tr>

                <th>
                  Fecha
                </th>

                <th>
                  Valor
                </th>

                <th>
                  Método
                </th>

                <th>
                  Estado
                </th>


              </tr>


            </thead>




            <tbody>


              {
                payments.map((payment)=>(


                  <tr key={payment.id}>


                    <td>

                      {payment.date}

                    </td>



                    <td className="payment-value">

                      {formatCurrency(payment.amount)}

                    </td>




                    <td>

                      {payment.method}

                    </td>




                    <td>

                      <span className="payment-status">

                        {payment.status}

                      </span>

                    </td>


                  </tr>


                ))
              }



            </tbody>



          </table>



        )
      }



    </div>

  );

}


export default PaymentTable;