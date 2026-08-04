import "./PaymentSection.css";

function PaymentSection({

  form,

  handleChange

}) {

  return (

    <section className="credit-section">

      <h2>

        Plan de pago

      </h2>

      <div className="credit-grid">

        <div>

          <label>

            Número de cuotas

          </label>

          <input

            type="number"

            name="installments"

            value={form.installments}

            onChange={handleChange}

            placeholder="Ej: 20"

          />

        </div>

        <div>

          <label>

            Frecuencia

          </label>

          <select

            name="frequency"

            value={form.frequency}

            onChange={handleChange}

          >

            <option value="Diario">

              Diario

            </option>

            <option value="Semanal">

              Semanal

            </option>

            <option value="Quincenal">

              Quincenal

            </option>

            <option value="Mensual">

              Mensual

            </option>

          </select>

        </div>

        <div>

          <label>

            Fecha del primer pago

          </label>

          <input

            type="date"

            name="firstPayment"

            value={form.firstPayment}

            onChange={handleChange}

          />

        </div>

      </div>

    </section>

  );

}

export default PaymentSection;