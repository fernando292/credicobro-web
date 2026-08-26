import "./ClientSection.css";

function ClientSection({
  form,
  handleChange,
  clients
}) {

  return (
    <section className="credit-section">

      <div className="credit-section__header">
        <div>
          <h2>
            Información del cliente
          </h2>

          <p>
            Selecciona el cliente y define la fecha del desembolso.
          </p>
        </div>
      </div>

      <div className="credit-grid">

        <div className="credit-field">

          <label htmlFor="credit-client">
            Cliente
          </label>

          <select
            id="credit-client"
            name="clientId"
            value={form.clientId || ""}
            onChange={handleChange}
          >

            <option value="">
              Seleccionar cliente
            </option>

            {clients.map((client) => (

              <option
                key={client.id}
                value={client.id}
              >
                {client.name}
              </option>

            ))}

          </select>

        </div>


        <div className="credit-field">

          <label htmlFor="credit-start-date">
            Fecha de desembolso
          </label>

          <input
            id="credit-start-date"
            type="date"
            name="startDate"
            value={form.startDate || ""}
            onChange={handleChange}
          />

        </div>

      </div>

    </section>
  );
}

export default ClientSection;