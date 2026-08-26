import { useState } from "react";

import "./PaymentForm.css";


function PaymentForm({ onSave }) {


  const [payment, setPayment] = useState({

    amount:"",

    method:"Efectivo",

    date:"",

  });


  const [
    isSaving,
    setIsSaving
  ] = useState(false);


  function handleChange(e){

    const {name,value}=e.target;


    setPayment((prev)=>({

      ...prev,

      [name]:value

    }));

  }


  async function handleSubmit(e){

    e.preventDefault();


    if (isSaving) {

      return;

    }


    setIsSaving(true);


    try {

      const newPayment={

        id:Date.now(),

        amount:Number(payment.amount),

        method:payment.method,

        date:payment.date,

        status:"Completado"

      };


      await onSave(newPayment);


      setPayment({

        amount:"",

        method:"Efectivo",

        date:""

      });


    } catch (error) {

      setIsSaving(false);

      throw error;

    }

  }


  return (

    <form

      className="payment-form"

      onSubmit={handleSubmit}

    >


      <h3>
        Registrar pago
      </h3>


      <div className="payment-form__grid">


        <div>

          <label>
            Valor del pago
          </label>


          <input

            type="number"

            name="amount"

            value={payment.amount}

            onChange={handleChange}

            placeholder="0"

            disabled={isSaving}

          />

        </div>


        <div>

          <label>
            Fecha
          </label>


          <input

            type="date"

            name="date"

            value={payment.date}

            onChange={handleChange}

            disabled={isSaving}

          />

        </div>


        <div>

          <label>
            Método
          </label>


          <select

            name="method"

            value={payment.method}

            onChange={handleChange}

            disabled={isSaving}

          >

            <option>
              Efectivo
            </option>

            <option>
              Transferencia
            </option>

            <option>
              Nequi
            </option>

            <option>
              Bancolombia
            </option>


          </select>


        </div>


      </div>


      <button

        type="submit"

        disabled={isSaving}

      >

        {

          isSaving

            ? "Guardando..."

            : "Guardar pago"

        }

      </button>


    </form>

  );

}


export default PaymentForm;