import "./FinancialSection.css";


function FinancialSection({

  form,

  handleChange

}) {


  return (

    <section className="credit-section">


      <h2>

        Información financiera

      </h2>



      <div className="credit-grid">



        <div>


          <label>

            Valor del préstamo

          </label>


          <input

            type="number"

            name="amount"

            value={form.amount}

            onChange={handleChange}

            placeholder="0"

          />


        </div>





        <div>


          <label>

            Interés (%)

          </label>


          <input

            type="number"

            name="interest"

            value={form.interest}

            onChange={handleChange}

            placeholder="0"

          />


        </div>



      </div>



    </section>

  );

}


export default FinancialSection;