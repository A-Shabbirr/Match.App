import styles from '../components/styles/usercard.module.css';

const UserCard = ({ user }) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>
                {user.header || user.name || 'Unnamed User'}
            </h3>

            <p className={styles.cardMeta}>
                UID: {user._id ? user._id.slice(0, 8) + '…' : 'N/A'}
            </p>
        </div>
    );
};

export default UserCard;