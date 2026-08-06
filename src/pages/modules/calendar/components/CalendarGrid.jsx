import "./CalendarGrid.css";



function CalendarGrid({ events = [] }) {

  const today = new Date();

  const year = today.getFullYear();

  const month = today.getMonth();

  const daysInMonth = new Date(

    year,

    month + 1,

    0

  ).getDate();



  const firstDay = new Date(

    year,

    month,

    1

  ).getDay();



  const weekDays = [

    "Dom",

    "Lun",

    "Mar",

    "Mié",

    "Jue",

    "Vie",

    "Sáb"

  ];



  const cells = [];



  for (let i = 0; i < firstDay; i++) {

    cells.push(

      <div

        key={`empty-${i}`}

        className="calendar-grid__empty"

      />

    );

  }



  for (let day = 1; day <= daysInMonth; day++) {

    const currentDate = new Date(

      year,

      month,

      day

    )

      .toISOString()

      .split("T")[0];



    const dayEvents = events.filter(

      event => event.date === currentDate

    );



    cells.push(

      <div

        key={day}

        className="calendar-day"

      >

        <div className="calendar-day__number">

          {day}

        </div>



        {

          dayEvents.map(item => (

            <div

              key={item.id}

              className={`calendar-event ${item.type}`}

            >

              {item.title}

            </div>

          ))

        }

      </div>

    );

  }



  return (

    <div className="calendar-grid-container">

      {

        weekDays.map(day => (

          <div

            key={day}

            className="calendar-grid__weekday"

          >

            {day}

          </div>

        ))

      }



      {cells}

    </div>

  );

}



export default CalendarGrid;