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

      if (!companyId) return;

      const data = await getNotifications(companyId);

      setNotifications(data);

    }

    loadNotifications();

  }, [companyId]);



  async function handleRead(notificationId) {

    await markNotificationAsRead(notificationId);

    setNotifications(prev =>

      prev.map(item =>

        item.id === notificationId

          ? { ...item, read: true }

          : item

      )

    );

  }



  async function handleClearHistory() {

    const confirmDelete = window.confirm(

      "¿Deseas eliminar todo el historial de notificaciones?"

    );

    if (!confirmDelete) return;

    await clearNotifications(companyId);

    setNotifications([]);

  }



  const unread = notifications.filter(item => !item.read).length;



  return (

    <div className="notification-center">

      <div className="notification-center__header">

        <div className="notification-center__title">

          <Bell size={20} />

          <div>

            <h3>Notificaciones</h3>

            <span>{unread} pendientes</span>

          </div>

        </div>

        <button

          className="notification-center__toggle"

          onClick={() => setCollapsed(!collapsed)}

        >

          {

            collapsed

              ? <ChevronDown size={18} />

              : <ChevronUp size={18} />

          }

        </button>

      </div>

      {

        !collapsed && (

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

                        className={`notification-card ${item.read ? "read" : ""}`}

                      >

                        <div>

                          <strong>{item.title}</strong>

                          <p>{item.message}</p>

                        </div>

                        {

                          !item.read && (

                            <button

                              onClick={() => handleRead(item.id)}

                            >

                              <CheckCircle2 size={18} />

                            </button>

                          )

                        }

                      </div>

                    ))

                  )

              }

            </div>

            {

              notifications.length > 0 && (

                <div
                  style={{
                    marginTop: "18px",
                    display: "flex",
                    justifyContent: "flex-end"
                  }}
                >

                  <button
                    onClick={handleClearHistory}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      border: "1px solid #ef4444",
                      background: "white",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >

                    <Trash2 size={18} />

                    Limpiar historial

                  </button>

                </div>

              )

            }

          </>

        )

      }

    </div>

  );

}

export default NotificationCenter;