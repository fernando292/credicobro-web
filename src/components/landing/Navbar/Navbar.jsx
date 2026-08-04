import {
  useNavigate
} from "react-router-dom";


import "./Navbar.css";



function Navbar() {


  const navigate = useNavigate();



  return (


    <header className="navbar">


      <div className="navbar__container">



        <div className="navbar__logo">

          CrediCobro

        </div>





        <nav className="navbar__links">


          <a href="/#soluciones">

            Soluciones

          </a>



          <a href="/#caracteristicas">

            Características

          </a>



          <a href="/#beneficios">

            Beneficios

          </a>



          <a href="/#precios">

            Precios

          </a>



          <a href="/#contacto">

            Contacto

          </a>



        </nav>







        <div className="navbar__actions">



          <button

            className="navbar__login"

            onClick={() => navigate("/login")}

          >

            Iniciar sesión

          </button>





          <button

            className="navbar__register"

            onClick={() => navigate("/register")}

          >

            Crear cuenta

          </button>



        </div>





      </div>


    </header>


  );

}



export default Navbar;