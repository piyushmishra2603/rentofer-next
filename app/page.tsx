import Header from '../components/Header'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import Cursor from '../components/Cursor'
import ProgressBar from '../components/ProgressBar'

export default function Page() {
  return (
    <>
      <ProgressBar />
      <Cursor />
      <div className="amb" aria-hidden>
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />
      </div>
      <div className="grid-bg" />

      <Header />
      <main>
        <Hero />
        {/* Rest of the homepage components will be added progressively (categories, services, how-it-works, etc.) */}
      </main>
      <Footer />
    </>
  )
}
