import "./NotesSection.css";

function NotesSection({

  form,

  handleChange

}) {

  return (

    <section className="credit-section">

      <h2>

        Observaciones

      </h2>

      <textarea

        name="notes"

        value={form.notes}

        onChange={handleChange}

        placeholder="Escribe observaciones del crédito..."

        rows={5}

      />

    </section>

  );

}

export default NotesSection;