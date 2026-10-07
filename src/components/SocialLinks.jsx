import { SocialIcon } from './Icons.jsx'

const links = [
  { label: 'Email', type: 'email', href: 'mailto:YOUR_EMAIL@example.com' },
  { label: 'LinkedIn', type: 'linkedin', href: 'https://www.linkedin.com/in/YOUR_LINKEDIN_PROFILE' },
  { label: 'Twitter', type: 'twitter', href: 'https://twitter.com/YOUR_TWITTER_HANDLE' },
  { label: 'GitHub', type: 'github', href: 'https://github.com/YOUR_GITHUB_USERNAME' },
]

export default function SocialLinks({ compact = false }) {
  return (
    <ul className={`social-links${compact ? ' social-links--compact' : ''}`}>
      {links.map((link) => (
        <li key={link.type}>
          <a
            href={link.href}
            aria-label={`${link.label} placeholder link`}
            title={`${link.label} placeholder — update before launch`}
            target={link.type === 'email' ? undefined : '_blank'}
            rel={link.type === 'email' ? undefined : 'noreferrer'}
          >
            <SocialIcon type={link.type} className="social-icon" />
            {!compact && <span>{link.label}</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}
