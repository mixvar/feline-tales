export interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export const SecondaryButton = ({
  children,
  onClick,
  disabled,
  buttonProps,
}: SecondaryButtonProps) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="bg-transparent text-felineGreen-dark border border-felineGreen-dark px-6 py-3 rounded-lg font-semibold hover:bg-felineGreen-dark hover:bg-opacity-10 transition-opacity focus:outline-felineGreen-dark"
    {...buttonProps}
  >
    {children}
  </button>
);
