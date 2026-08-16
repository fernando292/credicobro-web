import {
  useEffect,
  useState
} from "react";

import "./ExpenseForm.css";


function getToday() {
  return new Date()
    .toISOString()
    .split("T")[0];
}


function getDateValue(value) {
  if (!value) {
    return getToday();
  }

  if (typeof value === "string") {
    return value.split("T")[0];
  }

  if (value?.toDate) {
    return value
      .toDate()
      .toISOString()
      .split("T")[0];
  }

  if (value instanceof Date) {
    return value
      .toISOString()
      .split("T")[0];
  }

  return getToday();
}


function createInitialForm(expense) {
  return {
    description: expense?.description || "",
    category: expense?.category || "General",
    amount: expense?.amount ?? "",
    date: getDateValue(expense?.date),
    method:
      expense?.method ||
      expense?.paymentMethod ||
      "Efectivo",
    notes: expense?.notes || ""
  };
}


function ExpenseForm({
  expense,
  onSave,
  onCancel,
  saving = false
}) {
  const isEditing = Boolean(expense);

  const [form, setForm] = useState(
    createInitialForm(expense)
  );


  useEffect(() => {
    setForm(
      createInitialForm(expense)
    );
  }, [expense]);


  function handleChange(e) {
    const {
      name,
      value
    } = e.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  }


  function handleSubmit(e) {
    e.preventDefault();

    const description =
      form.description.trim();

    const amount =
      Number(form.amount);

    if (!description) {
      window.alert(
        "Ingresa una descripción para el egreso."
      );

      return;
    }

    if (!amount || amount <= 0) {
      window.alert(
        "Ingresa un valor mayor a cero."
      );

      return;
    }

    if (!form.date) {
      window.alert(
        "Selecciona la fecha del egreso."
      );

      return;
    }

    const expenseData = {
      description,
      category: form.category,
      amount,
      date: form.date,
      method: form.method,
      paymentMethod: form.method,
      notes: form.notes.trim(),
      type: "expense"
    };

    if (onSave) {
      onSave(expenseData);
    }
  }


  return (
    <form
      className="expense-form"
      onSubmit={handleSubmit}
    >
      <div className="expense-form__header">
        <div>
          <h3>
            {
              isEditing
                ? "Editar egreso"
                : "Registrar egreso"
            }
          </h3>

          <p>
            {
              isEditing
                ? "Actualiza la información del egreso."
                : "Registra un gasto de la empresa."
            }
          </p>
        </div>
      </div>

      <div className="expense-form__grid">
        <div className="expense-form__field">
          <label htmlFor="expense-description">
            Descripción
          </label>

          <input
            id="expense-description"
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ej. Compra de papelería"
            disabled={saving}
          />
        </div>

        <div className="expense-form__field">
          <label htmlFor="expense-category">
            Categoría
          </label>

          <select
            id="expense-category"
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={saving}
          >
            <option value="General">
              General
            </option>

            <option value="Transporte">
              Transporte
            </option>

            <option value="Operación">
              Operación
            </option>

            <option value="Servicios">
              Servicios
            </option>

            <option value="Personal">
              Personal
            </option>

            <option value="Otros">
              Otros
            </option>
          </select>
        </div>

        <div className="expense-form__field">
          <label htmlFor="expense-amount">
            Valor
          </label>

          <input
            id="expense-amount"
            type="number"
            name="amount"
            min="0"
            step="any"
            value={form.amount}
            onChange={handleChange}
            placeholder="Valor del egreso"
            disabled={saving}
          />
        </div>

        <div className="expense-form__field">
          <label htmlFor="expense-date">
            Fecha
          </label>

          <input
            id="expense-date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        <div className="expense-form__field">
          <label htmlFor="expense-method">
            Método
          </label>

          <select
            id="expense-method"
            name="method"
            value={form.method}
            onChange={handleChange}
            disabled={saving}
          >
            <option value="Efectivo">
              Efectivo
            </option>

            <option value="Transferencia">
              Transferencia
            </option>

            <option value="Otro">
              Otro
            </option>
          </select>
        </div>

        <div className="expense-form__field">
          <label htmlFor="expense-notes">
            Notas
          </label>

          <input
            id="expense-notes"
            type="text"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Nota opcional"
            disabled={saving}
          />
        </div>
      </div>

      <div className="expense-form__actions">
        {
          onCancel && (
            <button
              type="button"
              className="expense-form__cancel"
              onClick={onCancel}
              disabled={saving}
            >
              Cancelar
            </button>
          )
        }

        <button
          type="submit"
          className="expense-form__submit"
          disabled={saving}
        >
          {
            saving
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Registrar egreso"
          }
        </button>
      </div>
    </form>
  );
}


export default ExpenseForm;