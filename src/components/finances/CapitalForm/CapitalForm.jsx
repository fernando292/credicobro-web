import {
  useState
} from "react";

import "./CapitalForm.css";


function CapitalForm({
  onSave,
  onCancel,
  saving = false
}) {

  const [
    amount,
    setAmount
  ] = useState("");


  function handleSubmit(e) {

    e.preventDefault();


    const value =
      Number(amount);


    if (
      !value ||
      value <= 0
    ) {

      window.alert(
        "Ingresa un capital mayor que cero."
      );

      return;

    }


    if (onSave) {

      onSave(
        value
      );

    }

  }


  return (

    <form
      className="capital-form"
      onSubmit={
        handleSubmit
      }
    >

      <div className="capital-form__header">

        <div>

          <h3>
            Configurar capital
          </h3>

          <p>
            Ingresa el dinero que tienes actualmente
            disponible para prestar.
          </p>

        </div>

      </div>


      <div className="capital-form__field">

        <label htmlFor="capital-amount">

          Capital disponible para prestar

        </label>

        <input
          id="capital-amount"
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={
            e =>
              setAmount(
                e.target.value
              )
          }
          placeholder="Ej. 5000000"
          disabled={saving}
        />

        <span>
          Este valor será la base financiera
          de tu negocio de préstamos.
        </span>

      </div>


      <div className="capital-form__actions">

        {
          onCancel && (

            <button
              type="button"
              className="capital-form__cancel"
              onClick={
                onCancel
              }
              disabled={saving}
            >

              Cancelar

            </button>

          )
        }


        <button
          type="submit"
          className="capital-form__submit"
          disabled={saving}
        >

          {
            saving
              ? "Guardando..."
              : "Guardar capital"
          }

        </button>

      </div>

    </form>

  );

}


export default CapitalForm;