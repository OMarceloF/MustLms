import React, { useEffect, forwardRef, useState } from 'react';

interface AjudaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal = forwardRef<HTMLDivElement, AjudaModalProps>(
  ({ isOpen, onClose }, ref) => {
    const [openQuestions, setOpenQuestions] = useState<number[]>([]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen, onClose]);

    const toggleQuestion = (index: number) => {
      setOpenQuestions((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index]
      );
    };

    const faqList = [
      {
        question: 'Entre em contato com o suporte',
        answer:
          'Clique no botão "Enviar um Chamado", localizado logo abaixo deste accordion.',
      },
    ];

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="
   absolute top-[60px] right-2 sm:right-[10px]
   bg-white rounded-lg shadow-lg
   w-full sm:w-[400px] max-w-[95vw]      /* cabe 95vw no mobile */
   max-h-[70vh] overflow-y-auto
   p-2 sm:p-5                         /* padding reduzido no mobile */
   flex flex-col items-center
   z-[1001] animate-fade-in
 "     >
        <h2 className="text-[18px] mb-4 text-[#333] text-center font-semibold">
          Ajuda
        </h2>
        <p className="text-sm text-[#555] text-center mb-4 leading-relaxed tracking-tight">
          Resolva qualquer problema com algum de nossos atendendentes
        </p>

        <ul className="list-none p-0 my-4 w-full">
          {faqList.map((faq, index) => (
            <li key={index} className="mb-4">
              <strong
                onClick={() => toggleQuestion(index)}
                className="block text-sm text-[#333] mb-1 cursor-pointer hover:text-[#deef8df] transition-colors duration-200"
              >
                {faq.question}
                <span className="ml-2">
                  {openQuestions.includes(index) ? '-' : '+'}
                </span>
              </strong>
              {openQuestions.includes(index) && (
                <p className="text-xs text-[#555] m-0 leading-relaxed tracking-tight text-justify">
                  {faq.answer}
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className="flex justify-between gap-2 w-full mt-2">
          <button
            onClick={() => window.open('https://wa.me/5531989371121', '_blank')}
            className="bg-[#303030] text-white border-none py-2 px-4 rounded hover:bg-[#303030] transition-colors duration-300 text-sm w-1/2"
          >
            Enviar chamado
          </button>

          <button
            onClick={onClose}
            className="bg-[#303030] text-white border-none py-2 px-4 rounded hover:bg-[#303030] transition-colors duration-300 text-sm w-1/2"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }
);

export default HelpModal;
