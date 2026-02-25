import React from 'react';
import styles from '../components/styles/spinner.module.css';

const Spinner = () => {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className={styles.spinner} />
        </div>
    );
}

export default Spinner;
