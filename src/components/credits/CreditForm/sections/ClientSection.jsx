import "./ClientSection.css";


function ClientSection({

  form,

  handleChange,

  clients

}) {


  return (


    <section className="credit-section">


      <h2>

        Información del cliente

      </h2>



      <div className="credit-grid">



        <div>


          <label>

            Cliente

          </label>



          <select

            name="clientId"

            value={form.clientId || ""}

            onChange={handleChange}

          >


            <option value="">

              Seleccionar cliente

            </option>



            {
              clients.map((client)=>(


                <option

                  key={client.id}

                  value={client.id}

                >

                  {client.name}

                </option>


              ))
            }


          </select>


        </div>





        <div>


          <label>

            Fecha de desembolso

          </label>



          <input

            type="date"

            name="startDate"

            value={form.startDate}

            onChange={handleChange}

          />


        </div>



      </div>



    </section>


  );


}



export default ClientSection;