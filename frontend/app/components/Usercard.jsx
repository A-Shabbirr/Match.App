import styles from '../components/styles/usercard.module.css';

const DEFAULT_AVATAR = "https://res.cloudinary.com/dyi3wxmy3/image/upload/v1773435973/T_logo_iwqy4i.png";

const UserCard = ({ user }) => {
    if (!user) return null;

    const avatarUrl = user.profilePicture?.trim()
        ? `${user.profilePicture}?t=${Date.now()}`
        : DEFAULT_AVATAR;

    return (
        <div className={styles.card}>
            <img
                src={avatarUrl}
                alt={user.header || user.name || 'User Avatar'}
                className={styles.avatar}
                onError={(e) => (e.target.src = DEFAULT_AVATAR)}
            />

            <h3 className={styles.cardTitle}>
                {user.header || user.name || 'Unnamed User'}
            </h3>
        </div>
    );
};

export default UserCard;