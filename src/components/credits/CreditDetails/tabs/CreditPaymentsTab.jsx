import {
  useEffect,
  useState
} from "react";

import {
  useAuth
} from "../../../../context/AuthContext";

import {
  getUserProfile
} from "../../../../pages/modules/services/company/companyService";

import {
  getClientById
} from "../../../../pages/modules/services/clients/clientService";

import {
  getPayments
} from "../../../../pages/modules/services/payment/paymentService";

import {
  registerCreditPayment,
  deleteCreditPayment
} from "../../../../pages/modules/services/credit/creditBusinessService";

import "./CreditPaymentsTab.css";


function CreditPaymentsTab({
  credit,
  onCreditUpdated
}) {

  const { user } = useAuth();

  const [companyId, setCompanyId] =
    useState(null);

  const [payments, setPayments] =
    useState([]);

  const [isSaving, setIsSaving] =
    useState(false);

  const [form, setForm] = useState({
    value: "",
    method: "Efectivo",
    date: ""
  });


  /* ======================================================
     CARGAR PAGOS
  ====================================================== */

  useEffect(() => {

    async function loadPayments() {

      if (
        !user ||
        !credit
      ) {
        return;
      }

      try {

        const profile =
          await getUserProfile(
            user.uid
          );

        if (!profile?.companyId) {
          return;
        }

        const company =
          String(
            profile.companyId
          );

        setCompanyId(company);

        const data =
          await getPayments(
            company,
            String(credit.id)
          );

        setPayments(
          [...data].reverse()
        );

      } catch (error) {

        console.error(
          "Error cargando pagos:",
          error
        );

      }

    }

    loadPayments();

  }, [
    user,
    credit
  ]);


  /* ======================================================
     CAMBIAR FORMULARIO
  ====================================================== */

  function handleChange(e) {

    if (isSaving) {
      return;
    }

    setForm({

      ...form,

      [e.target.name]:
        e.target.value

    });

  }


  /* ======================================================
     REGISTRAR PAGO
  ====================================================== */

  async function handleSubmit(e) {

    e.preventDefault();


    if (isSaving) {
      return;
    }


    console.log(
      "CREDIT PAYMENT TAB EJECUTADO"
    );


    if (
      !form.value ||
      !companyId
    ) {
      return;
    }


    setIsSaving(true);


    try {

      /* ==================================================
         OBTENER CLIENTE
      ================================================== */

      let client = null;

      if (credit.clientId) {

        client =
          await getClientById(
            companyId,
            String(
              credit.clientId
            )
          );

      }


      /* ==================================================
         PREPARAR PAGO
      ================================================== */

      const payment = {

        value:
          Number(
            form.value
          ),

        method:
          form.method,

        date:
          form.date,

        createdAt:
          new Date(),

        clientId:
          credit.clientId ||
          null,

        client:
          client?.name ||
          credit.clientName ||
          credit.client ||
          "Cliente",

        phone:
          client?.phone ||
          ""

      };


      console.log(
        "DATOS PARA NOTIFICACIÓN:",
        {

          client:
            payment.client,

          phone:
            payment.phone,

          clientId:
            payment.clientId,

          amount:
            payment.value

        }
      );


      /* ==================================================
         REGISTRAR PAGO
      ================================================== */

      const result =
        await registerCreditPayment(
          companyId,
          String(credit.id),
          payment
        );


      /* ==================================================
         ACTUALIZAR LISTA
      ================================================== */

      setPayments(
        prev => [
          result.payment,
          ...prev
        ]
      );


      /* ==================================================
         ACTUALIZAR CRÉDITO
      ================================================== */

      if (
        onCreditUpdated
      ) {

        onCreditUpdated(
          result.updatedCredit
        );

      }


      /* ==================================================
         LIMPIAR FORMULARIO
      ================================================== */

      setForm({

        value: "",

        method:
          "Efectivo",

        date: ""

      });


    } catch (error) {

      console.error(
        "Error registrando pago:",
        error
      );

    } finally {

      setIsSaving(false);

    }

  }


  /* ======================================================
     ELIMINAR PAGO
  ====================================================== */

  async function handleDelete(
    paymentId
  ) {

    const ok =
      window.confirm(
        "¿Eliminar este pago?"
      );

    if (!ok) {
      return;
    }

    try {

      const result =
        await deleteCreditPayment(
          companyId,
          String(credit.id),
          String(paymentId)
        );


      /* ==================================================
         ELIMINAR DE LA LISTA
      ================================================== */

      setPayments(
        prev =>
          prev.filter(
            item =>
              String(item.id) !==
              String(paymentId)
          )
      );


      /* ==================================================
         ACTUALIZAR CRÉDITO
      ================================================== */

      if (
        onCreditUpdated
      ) {

        onCreditUpdated(
          result.updatedCredit
        );

      }

    } catch (error) {

      console.error(
        "Error eliminando pago:",
        error
      );

    }

  }


  /* ======================================================
     VALORES DEL CRÉDITO
  ====================================================== */

  const paidAmount =
    Number(
      credit?.paidAmount || 0
    );

  const balance =
    Number(
      credit?.balance || 0
    );

  const paidInstallments =
    Number(
      credit?.paidInstallments || 0
    );

  const totalInstallments =
    Number(
      credit?.installments || 0
    );

  const pendingInstallments =
    Number(
      credit?.pendingInstallments ??
      Math.max(
        totalInstallments -
        paidInstallments,
        0
      )
    );

  const installmentValue =
    Number(
      credit?.installmentValue || 0
    );


  /* ======================================================
     FORMATO DE MONEDA
  ====================================================== */

  function formatCurrency(
    value
  ) {

    return Number(
      value || 0
    ).toLocaleString(
      "es-CO"
    );

  }


  /* ======================================================
     RENDER
  ====================================================== */

  return (

    <div className="credit-payments">


      {/* ==================================================
         RESUMEN DE PAGOS
      ================================================== */}

      <div className="payment-summary">


        <div>

          <span>
            Pagos realizados
          </span>

          <strong>
            {payments.length}
          </strong>

        </div>


        <div>

          <span>
            Total abonado
          </span>

          <strong>

            $

            {formatCurrency(
              paidAmount
            )}

          </strong>

        </div>


        <div>

          <span>
            Saldo restante
          </span>

          <strong>

            $

            {formatCurrency(
              balance
            )}

          </strong>

        </div>


        <div>

          <span>
            Cuotas pagadas
          </span>

          <strong>

            {paidInstallments}

            {" / "}

            {totalInstallments}

          </strong>

        </div>


        <div>

          <span>
            Cuotas pendientes
          </span>

          <strong>
            {pendingInstallments}
          </strong>

        </div>


        <div>

          <span>
            Valor de cuota
          </span>

          <strong>

            $

            {formatCurrency(
              installmentValue
            )}

          </strong>

        </div>


      </div>


      {/* ==================================================
         FORMULARIO DE PAGO
      ================================================== */}

      <form

        className="payment-form"

        onSubmit={
          handleSubmit
        }

      >


        <input

          type="number"

          name="value"

          value={
            form.value
          }

          onChange={
            handleChange
          }

          placeholder="Valor del pago"

          min="1"

          disabled={
            isSaving
          }

        />


        <select

          name="method"

          value={
            form.method
          }

          onChange={
            handleChange
          }

          disabled={
            isSaving
          }

        >

          <option>
            Efectivo
          </option>

          <option>
            Transferencia
          </option>

          <option>
            Otro
          </option>

        </select>


        <input

          type="date"

          name="date"

          value={
            form.date
          }

          onChange={
            handleChange
          }

          disabled={
            isSaving
          }

        />


        <button

          type="submit"

          disabled={
            isSaving
          }

        >

          {

            isSaving

              ? "Registrando..."

              : "Registrar pago"

          }

        </button>


      </form>


      {/* ==================================================
         HISTORIAL DE PAGOS
      ================================================== */}

      <div className="payments-list">


        {

          payments.length === 0 ? (

            <div className="payment-item">

              <div>

                <strong>
                  Sin pagos registrados
                </strong>

                <span>
                  Este crédito todavía no tiene pagos.
                </span>

              </div>

            </div>

          ) : (

            payments.map(
              (
                payment,
                index
              ) => (

                <div

                  key={
                    payment.id
                  }

                  className="payment-item"

                >

                  <div>

                    <strong>

                      Pago #
                      {
                        payments.length -
                        index
                      }

                    </strong>


                    <strong>

                      $

                      {
                        formatCurrency(
                          payment.value
                        )
                      }

                    </strong>


                    <span>

                      Método:{" "}

                      {
                        payment.method ||
                        "No especificado"
                      }

                    </span>


                    <small>

                      Fecha:{" "}

                      {
                        payment.date ||
                        "Sin fecha"
                      }

                    </small>

                  </div>


                  <button

                    type="button"

                    onClick={() =>
                      handleDelete(
                        payment.id
                      )
                    }

                  >

                    Eliminar

                  </button>

                </div>

              )

            )

          )

        }


      </div>


    </div>

  );

}


export default CreditPaymentsTab;