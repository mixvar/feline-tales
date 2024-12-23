export interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export const PrimaryButton = ({ children, onClick, disabled, buttonProps }: PrimaryButtonProps) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="bg-felineGreen-dark bg-opacity-90 hover:bg-opacity-100 text-white px-6 py-3 rounded-lg font-semibold hover:bg-felineGreen-darker disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus:outline-felineGreen-dark"
    {...buttonProps}
  >
    {children}
  </button>
);
