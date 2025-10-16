import { useEffect, useState } from 'react';
interface NavItemProps {
    icon: React.ReactNode;
    text: string;
    isExpanded: boolean;
    onClick: () => void;
}
  
export default function NavItem({ icon, text, isExpanded, onClick }: NavItemProps) {

  const [showText, setShowText] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isExpanded) {
      timeout = setTimeout(() => setShowText(true), 200); // espera abrir a sidebar
    } else {
      setShowText(false); // esconde imediatamente ao recolher
    }
    return () => clearTimeout(timeout);
  }, [isExpanded]);

  return (
    <div
      className={`flex items-center cursor-pointer text-gray-700 hover:bg-gray-100 transition-all duration-300 ${
        isExpanded ? 'px-4 py-2 justify-start' : 'py-3 justify-center'
      }`}
      title={text}
      onClick={onClick}
    >
      <div
        className={`flex justify-center items-center ${
          isExpanded ? 'w-8 h-8 text-[20px]' : 'w-full text-[26px]'
        }`}
      >
        {icon}
      </div>

      {/* Só renderiza texto após o delay */}
      {showText && (
        <span
          className={`ml-3 text-sm font-medium transition-opacity duration-300 ${
            showText ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {text}
        </span>
        )}
    </div>
  );

  // return (
  //   <div
  //     className={`flex items-center cursor-pointer text-gray-700 hover:bg-gray-100 transition-all duration-300 ${
  //       isExpanded ? 'px-4 py-2 justify-start' : 'py-3 justify-center'
  //     }`}
  //     title={text}
  //     onClick={onClick}
  //   >
  //     <div
  //       className={`flex justify-center items-center ${
  //         isExpanded ? 'w-8 h-8 text-[20px]' : 'w-full text-[26px]'
  //       }`}
  //     >
  //       {icon}
  //     </div>
  
  //     {/* Renderiza o texto apenas se a sidebar estiver expandida */}
  //     {isExpanded && (
  //       <span className="ml-3 text-sm font-medium transition-all duration-500">
  //         {text}
  //       </span>
  //     )}
  //   </div>
  // );
  

}
