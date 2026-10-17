import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { ALAMAT, waLink } from '@/lib/config';
import { KATALOG, PRODUK } from '@/lib/catalog';
import heroImage from '@/public/landing/hero-desktop.webp';
import styles from './LandingHero.module.css';

export default function LandingHero() {
  return <section className={styles.hero} aria-labelledby="landing-title">
    <div className={styles.photograph}>
      <Image src={heroImage} alt="Ilustrasi sayuran segar dan bumbu dapur dalam keranjang anyaman" fill priority sizes="100vw" className={styles.image} />
      <span className={styles.caption}>Ilustrasi bahan segar</span>
    </div>
    <div className={styles.shade} aria-hidden="true" />
    <div className={`site-container ${styles.layout}`}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}><span />GROSIR & SUPPLIER · PONOROGO</p>
        <h1 id="landing-title" className={styles.title}>Dari dapur rumah<br />sampai <em>dapur usaha.</em></h1>
        <p className={styles.description}>Sayur segar, bumbu, buah, hingga sembako. Temukan kebutuhan dapur Anda di <strong>Bumbu Pawon</strong>, lalu pesan dengan mudah lewat WhatsApp.</p>
        <div className={styles.actions}>
          <a href={waLink('Halo Bumbu Pawon, saya ingin meminta penawaran kebutuhan dapur.')} className={styles.primary} target="_blank" rel="noopener noreferrer"><Icon name="chat" />Pesan via WhatsApp</a>
          <Link href="/supplier" className={styles.secondary}>Jelajahi katalog<Icon name="arrow" /></Link>
        </div>
        <div className={styles.facts}><span><strong>{PRODUK.length}</strong> pilihan produk</span><span><strong>{KATALOG.length}</strong> kategori kebutuhan</span><span>Grosir & eceran</span></div>
        <p className={styles.location}><Icon name="location" /><span>{ALAMAT}</span></p>
      </div>
    </div>
  </section>;
}
