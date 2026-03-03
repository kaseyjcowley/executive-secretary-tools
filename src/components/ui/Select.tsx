interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select = ({ children, className = "", ...props }: SelectProps) => {
  return (
    <select
      className={`w-full px-2.5 py-2 border border-slate-300 rounded text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};
