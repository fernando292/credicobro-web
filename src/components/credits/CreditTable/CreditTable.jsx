import {
  Eye,
  Pencil,
  Trash2
} from "lucide-react";

import { formatCurrency } from "../../../utils/currency";

import "./CreditTable.css";


function CreditTable({

  credits,

  onView,

  onEdit,

  onDelete

}) {


  if (credits.length === 0) {

    return (

      <div className="credit-table-empty">

        <h3>
          No hay créditos registrados
        </h3>

        <p>
          Crea tu primer crédito para comenzar.
        </p>

      </div>

    );

  }



  return (

    <div className="credit-table">

      <table>

        <thead>

          <tr>

            <th>Cliente</th>

            <th>Capital</th>

            <th>Saldo</th>

            <th>Cuotas</th>

            <th>Estado</th>

            <th>Acciones</th>

          </tr>

        </thead>


        <tbody>


          {

            credits.map((credit)=>(


              <tr key={credit.id}>


                <td>

                  {credit.client || "Sin cliente"}

                </td>



                <td>

                  {formatCurrency(

                    credit.amount

                  )}

                </td>



                <td>

                  {formatCurrency(

                    credit.balance

                  )}

                </td>




                <td>


                  {

                    Number(

                      credit.paidInstallments || 0

                    )

                  }


                  {" / "}


                  {

                    Number(

                      credit.installments || 0

                    )

                  }


                </td>





                <td>


                  <span

                    className={`credit-status ${

                      credit.status?.toLowerCase()

                    }`}

                  >

                    {credit.status}


                  </span>


                </td>





                <td>


                  <div className="credit-actions">


                    <button

                      onClick={()=>onView(credit)}

                      title="Ver"

                    >

                      <Eye size={23}/>

                    </button>



                    <button

                      onClick={()=>onEdit(credit)}

                      title="Editar"

                    >

                      <Pencil size={23}/>

                    </button>



                    <button

                      onClick={()=>onDelete(credit.id)}

                      title="Eliminar"

                    >

                      <Trash2 size={23}/>

                    </button>



                  </div>


                </td>



              </tr>


            ))

          }


        </tbody>


      </table>


    </div>


  );

}


export default CreditTable;