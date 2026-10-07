const capabilities = [
  'AI-accelerated',
  'Thoughtful design',
  'Production code',
  'Yours to own',
  'Built for speed',
]

export default function CapabilitiesMarquee() {
  return (
    <section className="capability-marquee" aria-label="AI-accelerated development, thoughtful design, production code, and client ownership">
      <div className="marquee-window" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div className="marquee-group" key={copy}>
              {capabilities.map((item) => (
                <span className="marquee-item" key={`${copy}-${item}`}>
                  {item}<b className="marquee-spark">✳</b>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
