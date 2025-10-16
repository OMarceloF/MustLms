interface TopBarItemProps {
    icon: React.ReactNode;
    text: string;
}
  
export default function TopBarItem({ icon, text }: TopBarItemProps) {
    return (
      <button className="top-bar-item" title={text}>
        {icon}
      </button>
    );
}