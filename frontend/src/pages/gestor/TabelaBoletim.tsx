import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table'; // ajuste o caminho conforme necessário

interface Subject {
  id: number;
  name: string;
  grades: number[];
  faltas?: number[]; // <- novo
  finalGrade: number;
  attendance: number;
}

interface TabelaBoletimProps {
  profile: { name: string };
  subjectsData: Subject[];
  tipoAvaliacao: 'bimestre' | 'trimestre' | 'semestre';
}

const TabelaBoletim = ({
  profile,
  subjectsData,
  tipoAvaliacao,
}: TabelaBoletimProps) => {
  const etapas = {
    bimestre: { qtd: 4, label: 'Bimestre' },
    trimestre: { qtd: 3, label: 'Trimestre' },
    semestre: { qtd: 2, label: 'Semestre' },
  }[tipoAvaliacao];

  return (
    <Table className="text-sm border border-gray-400 border-collapse w-full">
      <TableCaption>
        Desempenho acadêmico de {profile.name} em {new Date().getFullYear()}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead
            rowSpan={2}
            className="bg-gray-100 text-center border border-gray-500 px-2 py-1"
          >
            Disciplina
          </TableHead>
          {Array.from({ length: etapas.qtd }, (_, i) => (
            <TableHead
              colSpan={2}
              key={i}
              className="bg-gray-100 text-center border border-gray-500 px-2 py-1"
            >
              {`${i + 1}º ${etapas.label}`}
            </TableHead>
          ))}
          <TableHead
            rowSpan={2}
            className="bg-gray-100 text-center border border-gray-500 px-2 py-1"
          >
            Rec Final
          </TableHead>
          <TableHead
            rowSpan={2}
            className="bg-gray-100 text-center border border-gray-500 px-2 py-1"
          >
            Nota Final
          </TableHead>
          <TableHead
            rowSpan={2}
            className="bg-gray-100 text-center border border-gray-500 px-2 py-1"
          >
            Freq (%)
          </TableHead>
        </TableRow>
        <TableRow>
          {Array.from({ length: etapas.qtd }).flatMap((_, i) => [
            <TableHead
              key={`m${i}`}
              className="text-center border border-gray-400 bg-gray-100 px-2 py-1"
            >
              Nota
            </TableHead>,
            <TableHead
              key={`f${i}`}
              className="text-center border border-gray-400 bg-gray-100 px-2 py-1"
            >
              Faltas
            </TableHead>,
          ])}
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjectsData.map((subject) => (
          <TableRow key={subject.id} className="hover:bg-yellow-50">
            <TableCell className="font-medium">{subject.name}</TableCell>
            {Array.from({ length: etapas.qtd }).flatMap((_, i) => [
              <TableCell
                key={`g${i}`}
                className="text-center text-blue-800 border border-gray-500 px-2 py-1"
              >
                {subject.grades[i]?.toFixed(1) ?? '–'}
              </TableCell>,
              <TableCell className="text-center border border-gray-500 px-2 py-1">
                {subject.faltas?.[i] ?? 0}
              </TableCell>,
            ])}
            <TableCell className="text-center border border-gray-500 px-2 py-1">
              -
            </TableCell>
            <TableCell className="text-center text-blue-800 font-bold">
              {subject.finalGrade.toFixed(1)}
            </TableCell>
            <TableCell className="text-center border border-gray-500 px-2 py-1">
              {subject.attendance.toFixed(1)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TabelaBoletim;
