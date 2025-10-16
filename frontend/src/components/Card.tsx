import { ReactNode } from "react";

interface CardProps {
    icon: ReactNode;
    title: string;
    onClick?: () => void;
}
  
  
export default function Card({ icon, title, onClick }: CardProps) {
    return (
      <div className="card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
        {icon}
        <span>{title}</span>
      </div>
    );
}  