import "./NotificationBadge.css";

function NotificationBadge({ count = 0 }) {

  if (count <= 0) return null;

  return (

    <span className="notification-badge">

      {count > 99 ? "99+" : count}

    </span>

  );

}

export default NotificationBadge;