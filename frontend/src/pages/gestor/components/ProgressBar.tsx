import { Progress } from '../components/ui/progress';

interface UserProgressBarProps {
  progress: number;
}

export const UserProgressBar = ({ progress }: UserProgressBarProps) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-indigo-600">
          Progresso para o próximo nível
        </p>
        <p className="text-sm font-semibold text-gray-700">
          {Math.round(progress)}%
        </p>
      </div>
      <Progress
        value={progress}
        className="h-3 bg-indigo-100 transition-all duration-500"
      />
    </div>
  );
};
