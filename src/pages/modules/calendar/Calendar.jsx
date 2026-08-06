import { useEffect, useState } from "react";

import { useAuth } from "../../../context/AuthContext";

import { getUserProfile } from "../services/company/companyService";
import { getCalendarEvents } from "./services/calendarService";

import CalendarHeader from "./components/CalendarHeader";
import CalendarGrid from "./components/CalendarGrid";

import "./Calendar.css";



function Calendar() {

  const { user } = useAuth();

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    async function loadCalendar() {

      try {

        if (!user) return;

        const profile = await getUserProfile(user.uid);

        if (!profile?.companyId) return;

        const data = await getCalendarEvents(

          profile.companyId

        );

        setEvents(data);

      } catch (error) {

        console.error(

          "Error cargando calendario",

          error

        );

      } finally {

        setLoading(false);

      }

    }

    loadCalendar();

  }, [user]);



  if (loading) {

    return (

      <section className="calendar">

        <h2>Cargando calendario...</h2>

      </section>

    );

  }



  return (

    <section className="calendar">

      <CalendarHeader />



      <CalendarGrid

        events={events}

      />

    </section>

  );

}



export default Calendar;