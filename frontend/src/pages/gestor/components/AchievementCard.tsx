import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';

interface AchievementProps {
  achievement: {
    id: number;
    name: string;
    description: string;
    icon: React.ReactNode;
    progress: number;
    completed: boolean;
  };
}

export const AchievementCard = ({ achievement }: AchievementProps) => {
  return (
    <Card
      className={`p-4 rounded-lg shadow-sm transition-all duration-300 ${
        achievement.completed
          ? 'border-2 border-green-500 bg-green-50 ring-1 ring-green-200'
          : 'border border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-full ${
            achievement.completed ? 'bg-green-100' : 'bg-indigo-100'
          }`}
        >
          {achievement.icon}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-indigo-700">{achievement.name}</h3>
            {achievement.completed && (
              <Badge className="bg-green-500 text-white hover:bg-green-600 shadow-sm">
                Completo
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 mt-1">
            {achievement.description}
          </p>

          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-700 mb-1">
              <span>{achievement.progress}%</span>
            </div>
            <Progress
              value={achievement.progress}
              className={`h-2 rounded-full transition-all duration-500 ${
                achievement.completed ? 'bg-green-200' : 'bg-indigo-200'
              }`}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
