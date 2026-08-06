import NotificationItem from "./NotificationItem";

import "./NotificationDropdown.css";



function NotificationDropdown({

  notifications = [],

  unreadCount = 0,

  onClose,

  onMarkAllRead

}) {



  return (


    <div className="notification-dropdown">





      <div className="notification-dropdown__header">



        <div>


          <h3>

            Notificaciones

          </h3>



          <span>

            {unreadCount} pendientes

          </span>



        </div>




        {
          onClose && (

            <button

              className="notification-dropdown__close"

              onClick={onClose}

            >

              ×

            </button>

          )
        }




      </div>








      <div className="notification-dropdown__body">



        {

          notifications.length === 0

          ? (



            <div className="notification-dropdown__empty">



              <h4>

                No hay notificaciones

              </h4>



              <p>

                Cuando ocurra alguna actividad aparecerá aquí.

              </p>



            </div>



          )


          : (



            notifications.map(notification => (


              <NotificationItem

                key={notification.id}

                notification={notification}

              />


            ))



          )

        }



      </div>







      <div className="notification-dropdown__footer">



        {
          unreadCount > 0 && (

            <button

              onClick={onMarkAllRead}

            >

              Marcar todas como leídas


            </button>

          )
        }





        <button>


          Ver todas


        </button>




      </div>







    </div>


  );

}



export default NotificationDropdown;