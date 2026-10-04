import {
  UserRound,
  CalendarDays
} from "lucide-react";

import "./ClientSection.css";

function ClientSection({
  form,
  handleChange,
  clients
}) {
  const selectedClient = clients.find(
    client =>
      String(client.id) === String(form.clientId)
  );

  return (
    <section className="credit-section credit-client-section">

      <div className="credit-section__header">

        <div className="credit-section__title">

          <div className="credit-section__icon">
            <UserRound size={20} />
          </div>

          <div>

            <h2>
              Información del cliente
            </h2>

            <p>
              Selecciona el cliente y define la fecha del desembolso.
            </p>

          </div>

        </div>

      </div>

      <div className="credit-client-grid">

        <div className="credit-client-card">

          <div className="credit-client-card__top">

            <div className="credit-client-card__icon">
              <UserRound size={18} />
            </div>

            <div>

              <span className="credit-client-card__label">
                Cliente
              </span>

              <small>
                Persona que recibirá el crédito
              </small>

            </div>

          </div>

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

          <div className="credit-client-selected">

            {selectedClient ? (
              <>
                <span className="credit-client-selected__status" />

                <div>
                  <strong>
                    {selectedClient.name}
                  </strong>

                  {selectedClient.phone && (
                    <small>
                      {selectedClient.phone}
                    </small>
                  )}
                </div>
              </>
            ) : (
              <span>
                Ningún cliente seleccionado
              </span>
            )}

          </div>

        </div>

        <div className="credit-client-card">

          <div className="credit-client-card__top">

            <div className="credit-client-card__icon">
              <CalendarDays size={18} />
            </div>

            <div>

              <span className="credit-client-card__label">
                Fecha de desembolso
              </span>

              <small>
                Día en que se entrega el crédito
              </small>

            </div>

          </div>

          <input
            id="credit-start-date"
            type="date"
            name="startDate"
            value={form.startDate || ""}
            onChange={handleChange}
          />

          <div className="credit-client-date-info">
            <CalendarDays size={15} />

            <span>
              Define la fecha de inicio del crédito.
            </span>
          </div>

        </div>

      </div>

    </section>
  );
}

export default ClientSection;