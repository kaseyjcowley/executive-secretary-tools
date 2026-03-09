interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select = ({ children, className = "", ...props }: SelectProps) => {
  return (
    <select
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none 
        hover:border-gray-400 transition-colors duration-200 bg-white ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};
