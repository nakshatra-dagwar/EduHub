// Public landing page for the app. Shows hero section, features, and a call to action.
import Navbar from '../components/Navbar';
import styles from './home.module.css';
import Features from '../components/Features';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const Home = () => {
  // Landing page intentionally does not show dynamic course stats/tickers

  return (
    <div className={styles.wrapper}>
      <div className={styles.navSpace}>
        <Navbar />
      </div>
      <main>
        <div className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.blobs} aria-hidden>
              <span className={styles.blob1}></span>
              <span className={styles.blob2}></span>
              <span className={styles.blob3}></span>
            </div>
            <h1 className={`${styles.heading} ${styles.gradientText}`}>Empowering Minds, Shaping Futures</h1>
            <p className={styles.subheading}>
              Welcome to EduHub — your gateway to interactive learning, quizzes, and educational growth. Join our community of students, parents, and teachers working together for a brighter tomorrow.
            </p>
            <div className={styles.ctaRow}>
              <a href="/signup" className={styles.ctaBtn}>Get Started</a>
            </div>
            
          </section>

          <div id="features"><Features /></div>
          <CTA />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;