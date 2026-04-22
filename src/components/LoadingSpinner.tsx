interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
}

const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-14 h-14' };

const LoadingSpinner = ({ size = 'md', color = 'text-orange-500', label }: LoadingSpinnerProps) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <svg
      className={`animate-spin ${sizeMap[size]} ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label={label ?? 'Carregando'}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    {label && <span className="text-sm text-gray-400">{label}</span>}
  </div>
);

export default LoadingSpinner;
