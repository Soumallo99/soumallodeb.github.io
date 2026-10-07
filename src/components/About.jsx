import Reveal from './Reveal.jsx'
import SectionHeading from './SectionHeading.jsx'

const principles = [
  { number: '01', title: 'AI as an accelerator', text: 'More momentum, with a developer steering the work.' },
  { number: '02', title: 'Engineering first', text: 'Version control, clean code, and production-ready decisions.' },
  { number: '03', title: 'Ownership by default', text: 'Your accounts, your credentials, and a clear handover.' },
]

export default function About() {
  return (
    <section className="section-pad section-about" id="about" aria-labelledby="about-title">
      <div className="site-container about-layout">
        <Reveal className="about-heading">
          <SectionHeading id="about-title" eyebrow="A little about me / 04" title="About" />
          <div className="about-monogram glass-panel" aria-hidden="true">
            <span>S</span><span>D</span><i />
            <small>DEVELOPER<br />BY DESIGN</small>
          </div>
        </Reveal>

        <div className="about-content">
          <Reveal>
            <p className="about-statement">
              I&apos;m Soumallo Deb, a developer specializing in AI-accelerated web development. I combine agentic AI coding tools with standard engineering practices — GitHub version control, proper hosting, and clean handover — to deliver professional websites and web apps faster and more affordably than traditional agencies.
            </p>
          </Reveal>
          <div className="principles-grid">
            {principles.map((principle, index) => (
              <Reveal key={principle.number} delay={index * 0.06}>
                <article className="principle-card">
                  <span>{principle.number}</span>
                  <div><h3>{principle.title}</h3><p>{principle.text}</p></div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
