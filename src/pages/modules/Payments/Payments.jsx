import {
  useEffect,
  useState
} from "react";


import {
  useAuth
} from "../../../context/AuthContext";


import {
  getUserProfile
} from "../services/company/companyService";


import {
  getAllCompanyPayments
} from "../services/payment/paymentGlobalService";


import PaymentStats from "../../../components/payments/PaymentStats";

import PaymentTable from "../../../components/payments/PaymentTable/PaymentTable";


import "./Payments.css";





function Payments(){


  const { user } = useAuth();


  const [payments,setPayments] = useState([]);

  const [loading,setLoading] = useState(true);






  useEffect(()=>{


    async function loadPayments(){


      try{


        if(!user){

          return;

        }




        const profile = await getUserProfile(

          user.uid

        );





        if(!profile?.companyId){

          return;

        }





        const data = await getAllCompanyPayments(

          String(profile.companyId)

        );





        setPayments(

          data

        );




      }catch(error){


        console.error(

          "Error cargando pagos:",

          error

        );



      }finally{


        setLoading(false);


      }



    }




    loadPayments();



  },[user]);









  const totalCollected = payments.reduce(


    (total,payment)=>


      total +

      Number(

        payment.value || 0

      ),


    0


  );









  return (



    <section className="payments-page">





      <header className="payments-header">


        <div>


          <h1>

            Pagos

          </h1>


          <p>

            Controla pagos realizados y movimientos de cobro.

          </p>


        </div>



      </header>








      {

        loading ? (


          <div className="payments-loading">

            Cargando pagos...

          </div>



        ) : (



          <>


            <PaymentStats

              totalCollected={totalCollected}

              payments={payments}

            />






            <PaymentTable

              payments={payments}

            />



          </>


        )

      }







    </section>


  );


}




export default Payments;