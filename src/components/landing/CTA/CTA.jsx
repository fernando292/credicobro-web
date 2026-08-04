import {
  useNavigate
} from "react-router-dom";


import "./CTA.css";



function CTA() {


  const navigate = useNavigate();




  return (


    <section className="cta">


      <div className="cta__box">



        <h2>

          Empieza a gestionar tus cobros
          de forma profesional

        </h2>





        <p>

          Únete a CrediCobro y lleva el control
          de tus clientes, préstamos y pagos
          desde una sola plataforma.

        </p>





        <div className="cta__actions">





          <button

            onClick={() => navigate("/register")}

          >

            Crear cuenta gratis

          </button>








          <button

            className="cta__secondary"

            onClick={() => {

              document
                .getElementById("contacto")
                ?.scrollIntoView({

                  behavior: "smooth"

                });

            }}

          >

            Contactar ventas

          </button>





        </div>





      </div>


    </section>


  );

}



export default CTA;