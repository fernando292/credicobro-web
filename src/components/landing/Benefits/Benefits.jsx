import "./Benefits.css";

function Benefits() {

  const benefits = [
    {
      number: "01",
      title: "Ahorra tiempo",
      description:
        "Automatiza tareas administrativas y dedica más tiempo al crecimiento de tu negocio."
    },
    {
      number: "02",
      title: "Mayor control financiero",
      description:
        "Consulta préstamos, pagos y clientes desde una plataforma organizada."
    },
    {
      number: "03",
      title: "Reduce pagos atrasados",
      description:
        "Realiza seguimiento oportuno y conoce siempre el estado de cada cobro."
    },
    {
      number: "04",
      title: "Decisiones inteligentes",
      description:
        "Analiza información financiera mediante reportes claros y precisos."
    }
  ];


  return (
    <section className="benefits">

      <div className="benefits__header">

        <span>
          Beneficios
        </span>

        <h2>
          Lleva la gestión de cobros
          al siguiente nivel
        </h2>

        <p>
          Una herramienta diseñada para ayudarte
          a trabajar de forma más eficiente.
        </p>

      </div>


      <div className="benefits__content">

        {benefits.map((item) => (
          <div
            className="benefit-card"
            key={item.number}
          >

            <div className="benefit-number">
              {item.number}
            </div>


            <div>

              <h3>
                {item.title}
              </h3>


              <p>
                {item.description}
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default Benefits;