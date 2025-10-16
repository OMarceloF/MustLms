interface ProfileMenuItemProps {
    icon: React.ReactNode;
    text: string;
    onClick?: () => void;
}
  
export default function ProfileMenuItem({ icon, text, onClick }: ProfileMenuItemProps) {
    return (
      <div
        className="profile-menu-item"
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {icon}
        <span>{text}</span>
      </div>
    );
}
  