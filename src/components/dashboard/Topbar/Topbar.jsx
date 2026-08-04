import {
  Bell,
  Search
} from "lucide-react";

import "./Topbar.css";


function Topbar() {

  return (
    <header className="topbar">


      <div className="topbar__left">

        <h1>
          Resumen general
        </h1>

        <p>
          consulta el estado actual de tu operación financiera.
        </p>

      </div>



      <div className="topbar__actions">


        <div className="topbar__search">

          <Search size={18}/>

          <input
            type="text"
            placeholder="Buscar..."
          />

        </div>



        <button className="topbar__notification">

          <Bell size={20}/>

          <span>
            3
          </span>

        </button>



        <div className="topbar__profile">


          <div className="topbar__avatar">
            JD
          </div>


          <div>

            <strong>
              Usuario
            </strong>


            <small>
              Administrador
            </small>

          </div>


        </div>


      </div>


    </header>
  );
}


export default Topbar;