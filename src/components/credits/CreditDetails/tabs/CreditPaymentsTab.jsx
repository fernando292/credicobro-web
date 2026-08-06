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
  getPayments
} from "../../../../pages/modules/services/payment/paymentService";

import {
  registerCreditPayment,
  deleteCreditPayment
} from "../../../../pages/modules/services/credit/creditBusinessService";

import {
  notifyPaymentRegistered
} from "../../../../pages/modules/services/notifications/notificationEvents";

import "./CreditPaymentsTab.css";



function CreditPaymentsTab({

  credit,

  onCreditUpdated

}) {


  const { user } = useAuth();


  const [companyId,setCompanyId] = useState(null);

  const [payments,setPayments] = useState([]);


  const [form,setForm] = useState({

    value:"",
    method:"Efectivo",
    date:""

  });





  useEffect(()=>{


    async function load(){


      if(!user || !credit) return;



      try{


        const profile = await getUserProfile(

          user.uid

        );



        if(!profile?.companyId) return;



        const company = String(

          profile.companyId

        );



        setCompanyId(company);




        const data = await getPayments(

          company,

          String(credit.id)

        );



        setPayments(

          [...data].reverse()

        );



      }catch(error){


        console.error(

          "Error cargando pagos",

          error

        );


      }


    }



    load();



  },[user,credit]);








  function handleChange(e){


    setForm({

      ...form,

      [e.target.name]:e.target.value

    });


  }








  async function handleSubmit(e){


    e.preventDefault();



    if(

      !form.value ||

      !companyId

    ) return;





    try{



      const payment = {


        value:Number(form.value),


        method:form.method,


        date:form.date,


        createdAt:new Date()


      };





      const result = await registerCreditPayment(

        companyId,

        String(credit.id),

        payment

      );






      await notifyPaymentRegistered({

        companyId,

        client:

          credit.clientName ||

          credit.client ||

          "Cliente",


        amount:payment.value

      });







      setPayments(prev=>[

        result.payment,

        ...prev

      ]);






      if(onCreditUpdated){


        onCreditUpdated(

          result.updatedCredit

        );


      }






      setForm({

        value:"",

        method:"Efectivo",

        date:""

      });




    }catch(error){


      console.error(

        "Error registrando pago",

        error

      );


    }



  }









  async function handleDelete(paymentId){



    const ok = window.confirm(

      "¿Eliminar este pago?"

    );



    if(!ok) return;




    try{


      const result = await deleteCreditPayment(

        companyId,

        String(credit.id),

        String(paymentId)

      );






      setPayments(prev=>

        prev.filter(

          item =>

            String(item.id)!==String(paymentId)

        )

      );






      if(onCreditUpdated){


        onCreditUpdated(

          result.updatedCredit

        );


      }



    }catch(error){


      console.error(

        "Error eliminando pago",

        error

      );


    }



  }









  const totalPaid = payments.reduce(

    (total,payment)=>

      total +

      Number(payment.value || 0),

    0

  );









  return (


    <div className="credit-payments">





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

            {totalPaid.toLocaleString()}

          </strong>

        </div>





        <div>

          <span>
            Saldo restante
          </span>


          <strong>

            $

            {Number(

              credit.balance || 0

            ).toLocaleString()}


          </strong>


        </div>



      </div>









      <form

        className="payment-form"

        onSubmit={handleSubmit}

      >



        <input

          type="number"

          name="value"

          value={form.value}

          onChange={handleChange}

          placeholder="Valor del pago"

        />





        <select

          name="method"

          value={form.method}

          onChange={handleChange}

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

          value={form.date}

          onChange={handleChange}

        />





        <button>

          Registrar pago

        </button>



      </form>









      <div className="payments-list">



        {

          payments.map((payment,index)=>(


            <div

              key={payment.id}

              className="payment-item"

            >



              <div>


                <strong>

                  Pago #{payments.length-index}

                </strong>



                <strong>

                  $

                  {Number(

                    payment.value || 0

                  ).toLocaleString()}


                </strong>




                <span>

                  Método: {payment.method}

                </span>



                <small>

                  Fecha: {payment.date || "Sin fecha"}

                </small>



              </div>





              <button

                type="button"

                onClick={()=>handleDelete(payment.id)}

              >

                Eliminar

              </button>




            </div>


          ))

        }



      </div>





    </div>


  );


}



export default CreditPaymentsTab;