import { useEffect, useState } from "react";

import {
  Bell,
  CheckCircle2
} from "lucide-react";

import {
  getNotifications,
  markNotificationAsRead
} from "../../../pages/modules/services/notifications/notificationService";

import "./NotificationCenter.css";

function NotificationCenter({ companyId }) {

  const [notifications, setNotifications] = useState([]);

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

  return (

    <div className="notification-center">

      <div className="notification-center__header">

        <Bell size={20} />

        <h3>Notificaciones</h3>

      </div>

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

    </div>

  );

}

export default NotificationCenter;