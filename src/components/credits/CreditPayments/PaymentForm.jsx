import { useState } from "react";

import "./PaymentForm.css";


function PaymentForm({ onSave }) {


  const [payment, setPayment] = useState({

    amount:"",

    method:"Efectivo",

    date:"",

  });



  function handleChange(e){

    const {name,value}=e.target;


    setPayment((prev)=>({

      ...prev,

      [name]:value

    }));

  }



  function handleSubmit(e){

    e.preventDefault();


    const newPayment={

      id:Date.now(),

      amount:Number(payment.amount),

      method:payment.method,

      date:payment.date,

      status:"Completado"

    };


    onSave(newPayment);


    setPayment({

      amount:"",

      method:"Efectivo",

      date:""

    });


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



      <button type="submit">

        Guardar pago

      </button>


    </form>

  );

}


export default PaymentForm;