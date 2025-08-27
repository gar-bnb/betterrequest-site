type Variant = "primary" | "secondary" | "ghost";

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "px-6 py-3 rounded-bq font-semibold transition focus-visible:outline-none focus-visible:ring-2";
  const variants: Record<Variant, string> = {
  primary:
    "text-white bg-[#00a870] hover:bg-[#078a60] shadow-bq focus-visible:ring-2 focus-visible:ring-[#3fcf9a]",
  secondary:
    "text-[#4338ca] border border-[#4f46e5] hover:bg-[#eef2ff] focus-visible:ring-2 focus-visible:ring-[#c7d2fe]",
  ghost: "text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-300",
};


  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
