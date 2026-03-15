function Button({ children, onClick, variant = "primary", disabled }) {

  const base =
    "px-5 py-3 rounded-full text-sm font-bold transition";

  const variants = {
    primary: "bg-yellow-400 text-black hover:bg-yellow-300",
    danger: "bg-red-500 text-white hover:bg-red-400",
    secondary: "border border-white text-white hover:border-yellow-400 hover:text-yellow-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
}

export default Button;