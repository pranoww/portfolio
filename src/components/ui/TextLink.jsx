// Underlined text link used in sentences and link rows; outside links open in a new tab
export default function TextLink({ href, children, className = "", ...otherProps }) {
  const isOutsideLink = href.startsWith("http");
  return (
    <a
      href={href}
      className={`font-semibold underline decoration-blue decoration-2 underline-offset-[5px] transition-colors hover:text-blue ${className}`}
      {...(isOutsideLink && { target: "_blank", rel: "noreferrer" })}
      {...otherProps}
    >
      {children}
    </a>
  );
}
