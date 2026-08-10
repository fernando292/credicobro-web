
import { useEffect, useState } from "react";

import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";

import {
  getNotifications,
  markNotificationAsRead,
  clearNotifications
} from "../../../pages/modules/services/notifications/notificationService";

import "./NotificationCenter.css";


function NotificationCenter({ companyId }) {

  const [notifications, setNotifications] = useState([]);
  const [collapsed, setCollapsed] = useState(false);


  useEffect(() => {

    async function loadNotifications() {

      if (!companyId) {
        return;
      }

      try {

        const data =
          await getNotifications(companyId);

        setNotifications(data);

      } catch (error) {

        console.error(
          "Error cargando notificaciones:",
          error
        );

      }

    }


    loadNotifications();

  }, [companyId]);


  async function handleRead(notificationId) {

    try {

      await markNotificationAsRead(
        notificationId
      );

      setNotifications(
        previous =>
          previous.map(item =>
            item.id === notificationId
              ? {
                  ...item,
                  read: true
                }
              : item
          )
      );

    } catch (error) {

      console.error(
        "Error marcando notificación:",
        error
      );

    }

  }


  async function handleClearHistory() {

    const confirmDelete =
      window.confirm(
        "¿Deseas eliminar todo el historial de notificaciones?"
      );

    if (!confirmDelete) {
      return;
    }


    try {

      await clearNotifications(
        companyId
      );

      setNotifications([]);

    } catch (error) {

      console.error(
        "Error eliminando historial:",
        error
      );

    }

  }


  const unread =
    notifications.filter(
      item => !item.read
    ).length;


  return (

    <div className="notification-center">

      <div className="notification-center__header">

        <div className="notification-center__title">

          <Bell size={20} />

          <div>

            <h3>
              Notificaciones
            </h3>

            <span>
              {unread} pendientes
            </span>

          </div>

        </div>


        <button

          type="button"

          className="notification-center__toggle"

          onClick={() =>
            setCollapsed(
              previous => !previous
            )
          }

          aria-label={
            collapsed
              ? "Mostrar notificaciones"
              : "Ocultar notificaciones"
          }

        >

          {
            collapsed
              ? <ChevronDown size={18} />
              : <ChevronUp size={18} />
          }

        </button>

      </div>


      {!collapsed && (

        <>

          <div className="notification-center__list">

            {
              notifications.length === 0

                ? (

                  <p className="notification-center__empty">

                    No hay notificaciones.

                  </p>

                )

                : (

                  notifications.map(item => (

                    <div

                      key={item.id}

                      className={
                        `notification-card ${
                          item.read
                            ? "read"
                            : ""
                        }`
                      }

                    >

                      <div className="notification-card__content">

                        <strong>
                          {item.title}
                        </strong>

                        <p>
                          {item.message}
                        </p>

                      </div>


                      {!item.read && (

                        <button

                          type="button"

                          className="notification-card__read"

                          onClick={() =>
                            handleRead(
                              item.id
                            )
                          }

                          aria-label="Marcar como leída"

                        >

                          <CheckCircle2
                            size={18}
                          />

                        </button>

                      )}

                    </div>

                  ))

                )
            }

          </div>


          {notifications.length > 0 && (

            <div className="notification-center__footer">

              <button

                type="button"

                className="notification-center__clear"

                onClick={
                  handleClearHistory
                }

              >

                <Trash2 size={18} />

                <span>
                  Limpiar historial
                </span>

              </button>

            </div>

          )}

        </>

      )}

    </div>

  );

}


export default NotificationCenter;
