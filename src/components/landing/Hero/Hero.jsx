import "./Hero.css";

import {
  useNavigate
} from "react-router-dom";


import Button from "../../ui/Button/Button";


function Hero() {


  const navigate = useNavigate();




  return (
    <section className="hero">


      <div className="hero__content">


        <div className="hero__text">


          <div className="hero__badge">

            Gestión financiera inteligente

          </div>




          <h1>

            Controla tus préstamos y cobros

            <span>
              en un solo lugar
            </span>

          </h1>




          <p>

            CrediCobro ayuda a empresas y negocios a organizar
            clientes, administrar créditos, controlar pagos y
            mejorar su gestión financiera.

          </p>





          <div className="hero__actions">


            <Button

              onClick={() => navigate("/register")}

            >

              Crear cuenta gratis

            </Button>





            <button

              className="hero__secondary"

              onClick={() => navigate("/login")}

            >

              Iniciar sesión

            </button>



          </div>





          <div className="hero__stats">


            <div className="stat-card">

              <strong>
                +500
              </strong>

              <span>
                Clientes
              </span>

            </div>




            <div className="stat-card">

              <strong>
                $24M
              </strong>

              <span>
                Cobros gestionados
              </span>

            </div>





            <div className="stat-card">

              <strong>
                99%
              </strong>

              <span>
                Control
              </span>

            </div>



          </div>



        </div>






        <div className="hero__visual">


          <div className="dashboard-card">


            <div className="dashboard-top">


              <h3>

                CrediCobro Dashboard

              </h3>


              <span>

                ● Activo

              </span>


            </div>





            <p>

              Ingresos del mes

            </p>




            <h2>

              $24.850.000

            </h2>





            <div className="dashboard-items">


              <div>

                Clientes activos

                <strong>
                  248
                </strong>

              </div>





              <div>

                Pagos pendientes

                <strong>
                  32
                </strong>

              </div>





              <div>

                Créditos activos

                <strong>
                  216
                </strong>

              </div>


            </div>



          </div>



        </div>



      </div>



    </section>
  );
}


export default Hero;