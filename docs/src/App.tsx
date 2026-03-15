import { Hero } from './sections/Hero';
import { QuickStart } from './sections/QuickStart';
import { Metrics } from './sections/Metrics';
import { Config } from './sections/Config';
import { Footer } from './sections/Footer';

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 24px 120px',
  },
  nav: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    padding: '12px 24px',
    background: 'rgba(13, 13, 17, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    zIndex: 1000,
    fontSize: '13px',
  },
  navLink: {
    color: 'rgba(161, 161, 170, 0.8)',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
};

export function App() {
  return (
    <>
      <nav style={styles.nav}>
        <a href="#quickstart" style={styles.navLink}>Quick Start</a>
        <a href="#metrics" style={styles.navLink}>Metrics</a>
        <a href="#config" style={styles.navLink}>Config</a>
        <a href="https://github.com/dylsteck/jankmeter" style={styles.navLink} target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.npmjs.com/package/jankmeter" style={styles.navLink} target="_blank" rel="noopener">npm</a>
      </nav>
      <div style={styles.container}>
        <Hero />
        <QuickStart />
        <Metrics />
        <Config />
        <Footer />
      </div>
    </>
  );
}
