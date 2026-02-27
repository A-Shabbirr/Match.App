import styles from '../components/styles/tournamentCard.module.css';
import Link from 'next/link';

const TournamentCard = ({ tournament, linkdetail = '' }) => {
    const href = `${linkdetail}/${tournament._id}`;

    // Format dates if they exist
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    return (
        <Link href={href} className={styles.cardLink}>
            <div className={styles.card}>
                <h3 className={styles.title}>{tournament.name}</h3>
                <p className={styles.meta}>Type: {tournament.type}</p>
                <p className={styles.meta}>Status: {tournament.status || 'Upcoming'}</p>
                <p className={styles.meta}>
                    Dates: {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                </p>
                <p className={styles.players}>
                    Players: {tournament.players?.length || 0}
                </p>
            </div>
        </Link>
    );
};

export default TournamentCard;