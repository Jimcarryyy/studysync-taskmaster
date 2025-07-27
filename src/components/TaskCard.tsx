import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarDays, Clock, Edit3, Trash2, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  description?: string;
  course: string;
  courseType: 'math' | 'science' | 'english' | 'history' | 'other';
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  type: 'assignment' | 'project' | 'exam' | 'quiz';
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const courseColors = {
  math: 'bg-course-math',
  science: 'bg-course-science', 
  english: 'bg-course-english',
  history: 'bg-course-history',
  other: 'bg-course-other'
};

const priorityColors = {
  low: 'border-l-success',
  medium: 'border-l-warning',
  high: 'border-l-destructive'
};

const typeLabels = {
  assignment: 'Assignment',
  project: 'Project', 
  exam: 'Exam',
  quiz: 'Quiz'
};

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const timeUntilDue = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = timeUntilDue < 0;
  const isDueSoon = timeUntilDue <= 3 && timeUntilDue >= 0;

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Due yesterday';
    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays > 1) return `Due in ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card 
      className={cn(
        'border-l-4 transition-all duration-300 hover:shadow-card animate-slide-in-up',
        priorityColors[task.priority],
        task.completed && 'opacity-60',
        isOverdue && !task.completed && 'border-destructive/50 bg-destructive/5',
        isDueSoon && !task.completed && 'border-warning/50 bg-warning/5'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => onToggle(task.id)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-semibold text-foreground transition-all duration-200',
                task.completed && 'line-through text-muted-foreground'
              )}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          
          <div className={cn(
            'flex gap-1 transition-all duration-200',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              className={cn(
                'text-white text-xs',
                courseColors[task.courseType]
              )}
            >
              {task.course}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {typeLabels[task.type]}
            </Badge>
            {task.priority === 'high' && (
              <Flag className="h-4 w-4 text-destructive" />
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              <span className={cn(
                isOverdue && !task.completed && 'text-destructive font-medium',
                isDueSoon && !task.completed && 'text-warning font-medium'
              )}>
                {formatDueDate(task.dueDate)}
              </span>
            </div>
            {!task.completed && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className={cn(
                  isOverdue && 'text-destructive',
                  isDueSoon && 'text-warning'
                )}>
                  {timeUntilDue > 0 ? `${timeUntilDue}d` : 'Overdue'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}