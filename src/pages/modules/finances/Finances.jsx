import {
  useState
} from "react";

import useFinances from "../../../hooks/useFinances";

import {
  formatCurrency
} from "../../../utils/currency";

import FinanceTable from "../../../components/finances/FinanceTable/FinanceTable";
import ExpenseForm from "../../../components/finances/ExpenseForm/ExpenseForm";
import CapitalForm from "../../../components/finances/CapitalForm/CapitalForm";

import {
  createExpense,
  updateExpense,
  removeExpense
} from "../services/finance/expenseService";

import {
  setInitialCapital
} from "../services/finance/financeService";

import "./Finances.css";


function formatMovementDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  const date =
    value?.toDate
      ? value.toDate()
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin fecha";
  }

  return date.toLocaleDateString(
    "es-CO",
    {
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );
}


function Finances() {
  const {
    companyId,
    initialCapital,
    capitalAvailable,
    capitalPlaced,
    totalIncome,
    totalExpenses,
    netFlow,
    movements,
    loading,
    error,
    reload
  } = useFinances();

  const [showExpenseForm, setShowExpenseForm] =
    useState(false);

  const [showCapitalForm, setShowCapitalForm] =
    useState(false);

  const [savingExpense, setSavingExpense] =
    useState(false);

  const [savingCapital, setSavingCapital] =
    useState(false);

  const [selectedExpense, setSelectedExpense] =
    useState(null);

  const [selectedMovement, setSelectedMovement] =
    useState(null);


  function closeExpenseForm() {
    setShowExpenseForm(false);
    setSelectedExpense(null);
  }


  function openCreateExpense() {
    setSelectedExpense(null);
    setShowExpenseForm(true);
  }


  async function handleSaveCapital(amount) {
    if (!companyId) {
      window.alert(
        "No se encontró la empresa activa."
      );

      return;
    }

    try {
      setSavingCapital(true);

      await setInitialCapital(
        companyId,
        amount
      );

      setShowCapitalForm(false);

      await reload();

    } catch (error) {
      console.error(
        "Error configurando capital:",
        error
      );

      window.alert(
        error.message ||
        "No fue posible guardar el capital."
      );

    } finally {
      setSavingCapital(false);
    }
  }


  async function handleSaveExpense(expense) {
    if (!companyId) {
      window.alert(
        "No se encontró la empresa activa."
      );

      return;
    }

    try {
      setSavingExpense(true);

      if (selectedExpense) {
        const expenseId =
          selectedExpense.id ||
          selectedExpense.firestoreId;

        if (!expenseId) {
          throw new Error(
            "No se encontró el ID del egreso."
          );
        }

        await updateExpense(
          companyId,
          expenseId,
          expense
        );

      } else {
        await createExpense(
          companyId,
          expense
        );
      }

      closeExpenseForm();

      await reload();

    } catch (error) {
      console.error(
        "Error guardando egreso:",
        error
      );

      window.alert(
        error.message ||
        "No fue posible guardar el egreso."
      );

    } finally {
      setSavingExpense(false);
    }
  }


  function handleView(movement) {
    setSelectedMovement(movement);
  }


  function handleEdit(movement) {
    if (movement.type !== "expense") {
      window.alert(
        "Los ingresos provenientes de pagos no se pueden editar desde Finanzas."
      );

      return;
    }

    setSelectedMovement(null);
    setSelectedExpense(movement);
    setShowExpenseForm(true);
  }


  async function handleDelete(movement) {
    if (movement.type !== "expense") {
      window.alert(
        "Los ingresos provenientes de pagos no se pueden eliminar desde Finanzas."
      );

      return;
    }

    if (!companyId) {
      window.alert(
        "No se encontró la empresa activa."
      );

      return;
    }

    const expenseId =
      movement.id ||
      movement.firestoreId;

    if (!expenseId) {
      window.alert(
        "No se encontró el ID del egreso."
      );

      return;
    }

    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este egreso? Esta acción no se puede deshacer."
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeExpense(
        companyId,
        expenseId
      );

      if (
        selectedMovement?.id === movement.id ||
        selectedMovement?.firestoreId === movement.firestoreId
      ) {
        setSelectedMovement(null);
      }

      await reload();

    } catch (error) {
      console.error(
        "Error eliminando egreso:",
        error
      );

      window.alert(
        error.message ||
        "No fue posible eliminar el egreso."
      );
    }
  }


  if (loading) {
    return (
      <section className="finance-page">
        <div className="finance-loading">
          Cargando información financiera...
        </div>
      </section>
    );
  }


  if (error) {
    return (
      <section className="finance-page">
        <div className="finance-error">
          <h2>
            No fue posible cargar Finanzas
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={reload}
          >
            Intentar nuevamente
          </button>
        </div>
      </section>
    );
  }


  return (
    <section className="finance-page">
      <div className="finance-header">
        <div>
          <h1>
            Finanzas
          </h1>

          <p>
            Controla el capital, préstamos,
            ingresos y egresos.
          </p>
        </div>

        <div className="finance-header__actions">
          <button
            type="button"
            onClick={() =>
              setShowCapitalForm(previous => !previous)
            }
          >
            {
              showCapitalForm
                ? "Cerrar"
                : "Configurar capital"
            }
          </button>

          <button
            type="button"
            onClick={
              showExpenseForm
                ? closeExpenseForm
                : openCreateExpense
            }
          >
            {
              showExpenseForm
                ? "Cerrar"
                : "Registrar egreso"
            }
          </button>

          <button
            type="button"
            onClick={reload}
          >
            Actualizar
          </button>
        </div>
      </div>

      {
        showCapitalForm && (
          <div className="finance-capital-form">
            <CapitalForm
              onSave={handleSaveCapital}
              onCancel={() =>
                setShowCapitalForm(false)
              }
              saving={savingCapital}
            />
          </div>
        )
      }

      {
        showExpenseForm && (
          <div className="finance-expense-form">
            <ExpenseForm
              expense={selectedExpense}
              onSave={handleSaveExpense}
              onCancel={closeExpenseForm}
              saving={savingExpense}
            />
          </div>
        )
      }

      {
        selectedMovement && (
          <div className="finance-detail">
            <div className="finance-detail__header">
              <div>
                <h2>
                  Detalle del movimiento
                </h2>

                <p>
                  {
                    selectedMovement.type === "expense"
                      ? "Egreso"
                      : "Ingreso"
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedMovement(null)
                }
              >
                Cerrar
              </button>
            </div>

            <div className="finance-detail__content">
              <p>
                <strong>Descripción:</strong>{" "}
                {
                  selectedMovement.description ||
                  selectedMovement.name ||
                  "Sin descripción"
                }
              </p>

              <p>
                <strong>Valor:</strong>{" "}
                {formatCurrency(selectedMovement.amount)}
              </p>

              <p>
                <strong>Fecha:</strong>{" "}
                {formatMovementDate(selectedMovement.date)}
              </p>

              <p>
                <strong>Categoría:</strong>{" "}
                {
                  selectedMovement.category ||
                  "No aplica"
                }
              </p>

              <p>
                <strong>Método de pago:</strong>{" "}
                {
                  selectedMovement.method ||
                  selectedMovement.paymentMethod ||
                  "No especificado"
                }
              </p>

              <p>
                <strong>Notas:</strong>{" "}
                {
                  selectedMovement.notes ||
                  "Sin notas"
                }
              </p>
            </div>

            {
              selectedMovement.type === "expense" && (
                <div className="finance-detail__actions">
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(selectedMovement)
                    }
                  >
                    Editar egreso
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(selectedMovement)
                    }
                  >
                    Eliminar egreso
                  </button>
                </div>
              )
            }
          </div>
        )
      }

      <div className="finance-stats">
        <div className="finance-card">
          <span>Capital inicial</span>
          <strong>
            {formatCurrency(initialCapital)}
          </strong>
        </div>

        <div className="finance-card">
          <span>Capital disponible</span>
          <strong>
            {formatCurrency(capitalAvailable)}
          </strong>
        </div>

        <div className="finance-card">
          <span>Capital colocado</span>
          <strong>
            {formatCurrency(capitalPlaced)}
          </strong>
        </div>

        <div className="finance-card">
          <span>Intereses / flujo</span>
          <strong>
            {formatCurrency(netFlow)}
          </strong>
        </div>
      </div>

      <div className="finance-stats">
        <div className="finance-card">
          <span>Ingresos</span>
          <strong>
            {formatCurrency(totalIncome)}
          </strong>
        </div>

        <div className="finance-card">
          <span>Egresos</span>
          <strong>
            {formatCurrency(totalExpenses)}
          </strong>
        </div>

        <div className="finance-card">
          <span>Flujo neto</span>
          <strong>
            {formatCurrency(netFlow)}
          </strong>
        </div>

        <div className="finance-card">
          <span>Movimientos</span>
          <strong>
            {movements.length}
          </strong>
        </div>
      </div>

      <div className="finance-movements">
        <div className="finance-movements__header">
          <div>
            <h2>
              Movimientos financieros
            </h2>

            <p>
              Pagos y egresos registrados en el sistema.
            </p>
          </div>
        </div>

        <FinanceTable
          movements={movements}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </section>
  );
}


export default Finances;