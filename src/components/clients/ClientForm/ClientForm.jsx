import {
  useEffect,
  useState
} from "react";

import "./ClientForm.css";


function ClientForm({

  onSave,

  client

}) {


  const initialForm = {

    name: "",

    document: "",

    phone: "",

    email: "",

    address: "",

    status: "Activo"

  };



  const [form, setForm] = useState(initialForm);





  useEffect(() => {


    if (client) {


      setForm({

        ...initialForm,

        ...client

      });


    } else {


      setForm(initialForm);


    }


  }, [client]);







  function handleChange(e) {


    setForm({

      ...form,

      [e.target.name]: e.target.value

    });


  }








  function handleSubmit(e) {


    e.preventDefault();



    if (!form.name.trim()) {


      return;


    }





    onSave({

      ...form,

      id: client

        ? client.id

        : Date.now(),

      createdAt: client?.createdAt || new Date()


    });





    if (!client) {


      setForm(initialForm);


    }


  }









  return (


    <form

      className="client-form"

      onSubmit={handleSubmit}

    >





      <div className="client-form__grid">





        <div>


          <label>

            Nombre completo

          </label>



          <input

            name="name"

            value={form.name}

            onChange={handleChange}

            placeholder="Ej: Juan Pérez"

          />


        </div>







        <div>


          <label>

            Documento

          </label>



          <input

            name="document"

            value={form.document}

            onChange={handleChange}

            placeholder="Número de documento"

          />


        </div>







        <div>


          <label>

            Teléfono

          </label>



          <input

            name="phone"

            value={form.phone}

            onChange={handleChange}

            placeholder="300 000 0000"

          />


        </div>







        <div>


          <label>

            Correo

          </label>



          <input

            name="email"

            value={form.email}

            onChange={handleChange}

            placeholder="correo@email.com"

          />


        </div>







        <div className="client-form__full">


          <label>

            Dirección

          </label>



          <input

            name="address"

            value={form.address}

            onChange={handleChange}

            placeholder="Dirección del cliente"

          />


        </div>






      </div>







      <button

        type="submit"

      >

        {

          client

            ? "Actualizar cliente"

            : "Guardar cliente"

        }


      </button>






    </form>


  );


}



export default ClientForm;