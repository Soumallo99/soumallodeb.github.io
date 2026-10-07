import SocialLinks from './SocialLinks.jsx'
import { ArrowUpRight } from './Icons.jsx'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <a className="footer-brand" href="#home" aria-label="Kade Voss, back to top">
          KV<span>.</span>
        </a>
        <p>© 2025 Kade Voss. All rights reserved.</p>
        <SocialLinks compact />
        <a className="back-to-top" href="#home">Back to top <ArrowUpRight className="icon-14" /></a>
      </div>
    </footer>
  )
}
