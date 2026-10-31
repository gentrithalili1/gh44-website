interface ContactItemProps {
  label: string;
  children: React.ReactNode;
}

export function ContactItem({ label, children }: ContactItemProps) {
  return (
    <li>
      <span className="block text-xs tracking-kicker text-faint">{label}</span>
      {children}
    </li>
  );
}
