// The site's main button: a black pill with a lime dot that turns blue on hover, as a link or a form button
const pillClassName =
  "group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-ink px-6 py-3 font-semibold text-white transition duration-200 hover:bg-blue active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-60";

export default function PillButton({ href, children, className = "", ...otherProps }) {
  const content = (
    <>
      {children}
      <span aria-hidden="true" className="size-2 rounded-full bg-lime transition-transform duration-200 group-hover:scale-150" />
    </>
  );

  if (href) {
    return <a href={href} className={`${pillClassName} ${className}`} {...otherProps}>{content}</a>;
  }
  return <button className={`${pillClassName} ${className}`} {...otherProps}>{content}</button>;
}
