import styles from '../components/styles/tournamentCard.module.css';
import Link from 'next/link';

const TournamentCard = ({ tournament, linkdetail = '' }) => {
    const href = `${linkdetail}/${tournament.id}`
    return (
        <Link href={href} className={styles.cardLink}>
            <div className={styles.card}>
                <h3 className={styles.title}>{tournament.name}</h3>
                <p className={styles.meta}>Type: {tournament.type}</p>
                <p className={styles.meta}>Status: {tournament.status}</p>
                <p className={styles.meta}>
                    Dates: {tournament.startDate} - {tournament.endDate}
                </p>
                <p className={styles.players}>
                    Players: {tournament.players?.length || 0}
                </p>
            </div>
        </Link>
    );
};

export default TournamentCard;
