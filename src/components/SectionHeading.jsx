export default function SectionHeading({ id, eyebrow, title, description, align = 'left' }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <p className="eyebrow"><span className="eyebrow-mark" />{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
    </div>
  )
}
