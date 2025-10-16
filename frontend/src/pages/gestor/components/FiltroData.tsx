import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ptBR from 'date-fns/locale/pt-BR';

registerLocale('pt-BR', ptBR);

interface FiltroDataProps {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
}

function FiltroData({ startDate, endDate, setStartDate, setEndDate }: FiltroDataProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 w-full px-4 py-2">
      <div className="flex flex-col items-start gap-1">
        <label className="font-semibold text-base text-gray-800">Data Inicial:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
          className="w-44 h-9 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#759C9D] focus:ring-2 focus:ring-[#759C9D]"
        />
      </div>

      <div className="flex flex-col items-start gap-1">
        <label className="font-semibold text-base text-gray-800">Data Final:</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
          className="w-44 h-9 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#759C9D] focus:ring-2 focus:ring-[#759C9D]"
        />
      </div>
    </div>
  );
}

export default FiltroData;
