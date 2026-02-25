import styles from '../components/styles/usercard.module.css';

const UserCard = ({ user }) => {
    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>
                {user.header || 'Unnamed User'}
            </h3>

            <p className={styles.cardMeta}>
                {/* UID: {user.id.slice(0, 8)}… */}
            </p>
        </div>
    );
};

export default UserCard;
