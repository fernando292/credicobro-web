import "./CalendarHeader.css";



function CalendarHeader() {

  const today = new Date();

  const month = today.toLocaleDateString("es-CO", {

    month: "long",

    year: "numeric"

  });



  return (

    <div className="calendar-header">

      <div>

        <h1>Calendario</h1>

        <p>

          Agenda de cobros y seguimientos

        </p>

      </div>



      <div className="calendar-header__month">

        {month}

      </div>

    </div>

  );

}



export default CalendarHeader;