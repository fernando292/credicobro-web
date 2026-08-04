import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  registerUser
} from "../../modules/services/auth/authService";


import {
  createCompany,
  createUserProfile
} from "../../modules/services/company/companyService";


import "./Register.css";



function Register() {


  const navigate = useNavigate();



  const [form, setForm] = useState({

    name: "",

    company: "",

    email: "",

    password: ""

  });



  const [loading, setLoading] = useState(false);





  function handleChange(e) {


    const {
      name,
      value
    } = e.target;



    setForm((prev)=>({

      ...prev,

      [name]: value

    }));


  }





  async function handleSubmit(e) {


    e.preventDefault();



    try {


      setLoading(true);



      const user = await registerUser(

        form.email,

        form.password

      );





      const companyId = await createCompany({

        name: form.company,

        createdAt: new Date()

      });





      await createUserProfile(

        user.uid,

        {

          name: form.name,

          email: form.email,

          role: "admin",

          companyId

        }

      );





      navigate("/dashboard");



    } catch(error) {


      console.error(error);



      alert(

        error.message

      );


    } finally {


      setLoading(false);


    }


  }





  return (


    <div className="register-page">


      <form

        className="register-card"

        onSubmit={handleSubmit}

      >


        <h1>

          Crear cuenta

        </h1>





        <input

          type="text"

          name="name"

          placeholder="Nombre completo"

          value={form.name}

          onChange={handleChange}

          required

        />





        <input

          type="text"

          name="company"

          placeholder="Nombre de empresa"

          value={form.company}

          onChange={handleChange}

          required

        />





        <input

          type="email"

          name="email"

          placeholder="Correo electrónico"

          value={form.email}

          onChange={handleChange}

          required

        />





        <input

          type="password"

          name="password"

          placeholder="Contraseña"

          value={form.password}

          onChange={handleChange}

          required

        />





        <button

          type="submit"

          disabled={loading}

        >


          {

            loading

              ? "Creando cuenta..."

              : "Registrarse"

          }


        </button>



      </form>


    </div>


  );

}


export default Register;