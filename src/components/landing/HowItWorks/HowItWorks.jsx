import "./HowItWorks.css";

function HowItWorks() {

  const steps = [
    {
      number: "01",
      title: "Registra tus clientes",
      description:
        "Centraliza la información de tus clientes y consulta su historial financiero fácilmente."
    },
    {
      number: "02",
      title: "Gestiona préstamos",
      description:
        "Administra créditos, montos, fechas de pago y estados desde una sola plataforma."
    },
    {
      number: "03",
      title: "Controla pagos",
      description:
        "Haz seguimiento a pagos realizados, pendientes y próximos vencimientos."
    },
    {
      number: "04",
      title: "Analiza resultados",
      description:
        "Visualiza reportes para tomar mejores decisiones financieras."
    }
  ];


  return (
    <section className="how">

      <div className="how__header">

        <span>
          Cómo funciona
        </span>

        <h2>
          Gestiona todo tu proceso financiero
          de manera simple
        </h2>

        <p>
          CrediCobro organiza cada etapa del proceso
          para que tengas mayor control de tu negocio.
        </p>

      </div>


      <div className="how__grid">

        {steps.map((step) => (
          <div
            className="step-card"
            key={step.number}
          >

            <div className="step-number">
              {step.number}
            </div>


            <h3>
              {step.title}
            </h3>


            <p>
              {step.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}


export default HowItWorks;