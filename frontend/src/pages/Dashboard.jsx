import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1>PFM</h1>
        <button type="button" className={styles.logout} onClick={handleLogout}>
          Sign out
        </button>
      </header>
      <main className={styles.main}>
        <p className={styles.welcome}>You're signed in.</p>
      </main>
    </div>
  )
}
