
import {
  Search,
  Users,
  CreditCard,
  Wallet,
  X
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import {
  useSearch
} from "../../../context/SearchContext";

import NotificationBell from "../../notifications/NotificationBell";

import "./Topbar.css";



function Topbar() {

  const navigate = useNavigate();


  const {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    clearSearch
  } = useSearch();



  function handleResultClick(result) {

    if (result.type === "client") {

      navigate("/clientes");

    }



    if (result.type === "credit") {

      navigate("/creditos");

    }



    if (result.type === "payment") {

      navigate("/pagos");

    }



    clearSearch();

  }



  function getResultIcon(type) {

    if (type === "client") {

      return <Users size={18} />;

    }



    if (type === "credit") {

      return <CreditCard size={18} />;

    }



    if (type === "payment") {

      return <Wallet size={18} />;

    }



    return <Search size={18} />;

  }



  const showResults =
    searchTerm.trim().length > 0;



  return (

    <header className="topbar">


      <div className="topbar__left">


        <h1>
          Resumen general
        </h1>


        <p>
          Consulta el estado actual de tu operación financiera.
        </p>


      </div>




      <div className="topbar__actions">


        <div className="topbar__search">


          <Search size={18} />


          <input

            type="text"

            placeholder="Buscar..."

            value={searchTerm}

            onChange={(e) =>

              setSearchTerm(
                e.target.value
              )

            }

          />


          {
            searchTerm && (

              <button

                type="button"

                className="topbar__search-clear"

                onClick={clearSearch}

              >

                <X size={16} />

              </button>

            )
          }


          {
            showResults && (

              <div className="topbar__search-results">


                {
                  loading ? (

                    <div className="topbar__search-message">

                      Buscando...

                    </div>

                  ) : results.length === 0 ? (

                    <div className="topbar__search-message">

                      No se encontraron resultados.

                    </div>

                  ) : (

                    results.map((result) => (

                      <button

                        type="button"

                        className="topbar__search-result"

                        key={result.id}

                        onClick={() =>
                          handleResultClick(
                            result
                          )
                        }

                      >


                        <div className="topbar__search-result-icon">

                          {
                            getResultIcon(
                              result.type
                            )
                          }

                        </div>



                        <div className="topbar__search-result-content">


                          <strong>

                            {result.title}

                          </strong>


                          <span>

                            {result.subtitle}

                          </span>


                          {
                            result.description && (

                              <small>

                                {result.description}

                              </small>

                            )
                          }


                        </div>


                      </button>

                    ))

                  )
                }


              </div>

            )
          }


        </div>




        <NotificationBell />




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
