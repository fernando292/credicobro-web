import "./Pricing.css";


function Pricing() {


  const plans = [

    {
      name: "Básico",
      price: "$29.900",
      description:
        "Ideal para pequeños negocios que empiezan a organizar sus cobros.",
      features: [
        "Gestión de clientes",
        "Registro de préstamos",
        "Control de pagos"
      ]
    },


    {
      name: "Profesional",
      price: "$59.900",
      popular: true,
      description:
        "La opción ideal para negocios que necesitan mayor control.",
      features: [
        "Todo lo del plan básico",
        "Reportes financieros",
        "Seguimiento avanzado",
        "Soporte prioritario"
      ]
    },


    {
      name: "Empresa",
      price: "$99.900",
      description:
        "Para empresas con mayores necesidades de gestión.",
      features: [
        "Usuarios ilimitados",
        "Reportes completos",
        "Configuraciones avanzadas"
      ]
    }

  ];



  return (

    <section className="pricing">


      <div className="pricing__header">

        <span>
          Planes
        </span>


        <h2>
          Elige el plan ideal para tu negocio
        </h2>


        <p>
          Empieza a gestionar tus cobros de manera profesional.
        </p>


      </div>



      <div className="pricing__grid">


        {
          plans.map((plan) => (

            <div
              className={
                plan.popular
                  ? "pricing-card pricing-card--popular"
                  : "pricing-card"
              }
              key={plan.name}
            >


              {
                plan.popular && (
                  <div className="pricing-card__badge">
                    Recomendado
                  </div>
                )
              }



              <h3>
                {plan.name}
              </h3>


              <strong>
                {plan.price}
              </strong>


              <p>
                {plan.description}
              </p>



              <ul>

                {
                  plan.features.map((feature) => (

                    <li key={feature}>
                      ✓ {feature}
                    </li>

                  ))
                }

              </ul>



              <button>
                Comenzar
              </button>


            </div>

          ))
        }


      </div>


    </section>

  );

}


export default Pricing;