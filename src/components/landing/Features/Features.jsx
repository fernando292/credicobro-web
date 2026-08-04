import "./Features.css";

function Features() {
  const features = [
    {
      title: "Gestión de clientes",
      description:
        "Organiza clientes, datos de contacto y todo su historial financiero desde un solo lugar.",
      icon: "👥",
    },
    {
      title: "Control de préstamos",
      description:
        "Administra créditos, montos, fechas de pago y estados de cada préstamo.",
      icon: "💳",
    },
    {
      title: "Seguimiento de pagos",
      description:
        "Controla pagos realizados, pendientes y próximos vencimientos fácilmente.",
      icon: "📅",
    },
    {
      title: "Reportes financieros",
      description:
        "Obtén información clara para tomar mejores decisiones sobre tu negocio.",
      icon: "📊",
    },
  ];

  return (
    <section className="features">

      <div className="features__header">

        <span>
          Funcionalidades
        </span>

        <h2>
          Todo lo que necesitas para
          gestionar tus cobros
        </h2>

        <p>
          CrediCobro reúne las herramientas necesarias
          para administrar tu negocio de forma organizada.
        </p>

      </div>


      <div className="features__grid">

        {features.map((feature) => (
          <div
            className="feature-card"
            key={feature.title}
          >

            <div className="feature-card__icon">
              {feature.icon}
            </div>


            <h3>
              {feature.title}
            </h3>


            <p>
              {feature.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}

export default Features;