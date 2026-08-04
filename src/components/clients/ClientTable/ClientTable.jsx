import {
  Eye,
  Pencil,
  Trash2
} from "lucide-react";

import "./ClientTable.css";


function ClientTable({

  clients,

  onView,

  onEdit,

  onDelete

}) {



  return (


    <div className="client-table">


      <table>


        <thead>


          <tr>

            <th>
              Nombre
            </th>


            <th>
              Documento
            </th>


            <th>
              Teléfono
            </th>


            <th>
              Estado
            </th>


            <th>
              Acciones
            </th>


          </tr>


        </thead>




        <tbody>


          {

            clients.map((client)=>(


              <tr key={client.id}>


                <td>

                  {client.name}

                </td>



                <td>

                  {client.document}

                </td>



                <td>

                  {client.phone}

                </td>




                <td>


                  <span className="client-status">

                    {client.status}

                  </span>


                </td>




                <td>


                  <div className="client-actions">



                    <button

                      title="Ver"

                      onClick={()=>onView(client)}

                    >

                      <Eye size={18}/>

                    </button>





                    <button

                      title="Editar"

                      onClick={()=>onEdit(client)}

                    >

                      <Pencil size={18}/>

                    </button>





                    <button

                      title="Eliminar"

                      onClick={()=>onDelete(client.id)}

                    >

                      <Trash2 size={18}/>

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


export default ClientTable;