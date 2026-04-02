function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-100 p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
