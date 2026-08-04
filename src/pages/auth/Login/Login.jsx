import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  loginUser
} from "../../modules/services/auth/authService";

import "./Login.css";


function Login() {


  const navigate = useNavigate();



  const [form, setForm] = useState({

    email: "",

    password: ""

  });



  const [loading, setLoading] = useState(false);





  function handleChange(e) {


    const {
      name,
      value
    } = e.target;



    setForm((prev) => ({

      ...prev,

      [name]: value

    }));


  }





  async function handleSubmit(e) {


    e.preventDefault();



    try {


      setLoading(true);



      await loginUser(

        form.email,

        form.password

      );



      navigate("/dashboard");



    } catch(error) {


      console.error(error);



      alert(

        "Correo o contraseña incorrectos"

      );


    } finally {


      setLoading(false);


    }


  }





  return (


    <div className="login-page">


      <form

        className="login-card"

        onSubmit={handleSubmit}

      >


        <h1>

          Iniciar sesión

        </h1>





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

              ? "Ingresando..."

              : "Entrar"

          }


        </button>



      </form>


    </div>


  );

}


export default Login;