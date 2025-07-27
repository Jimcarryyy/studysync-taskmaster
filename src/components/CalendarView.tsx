import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, CalendarDays, Filter } from 'lucide-react';
import { Task } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  tasks: Task[];
  onTaskSelect?: (task: Task) => void;
}

type ViewMode = 'month' | 'week' | 'agenda';
type FilterType = 'all' | 'pending' | 'high-priority' | 'due-soon';

export function CalendarView({ tasks, onTaskSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    switch (filter) {
      case 'pending':
        filtered = tasks.filter(task => !task.completed);
        break;
      case 'high-priority':
        filtered = tasks.filter(task => task.priority === 'high');
        break;
      case 'due-soon':
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        filtered = tasks.filter(task => 
          !task.completed && 
          task.dueDate <= threeDaysFromNow && 
          task.dueDate >= new Date()
        );
        break;
    }

    return filtered;
  }, [tasks, filter]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTasksForDate = (date: Date) => {
    return filteredTasks.filter(task => isSameDay(task.dueDate, date));
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

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

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Calendar</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="high-priority">High Priority</SelectItem>
                <SelectItem value="due-soon">Due Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="agenda">Agenda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === 'month' && (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentDate}
                  onMonthChange={setCurrentDate}
                  className="w-full"
                  components={{
                    Day: ({ date, ...props }) => {
                      const dayTasks = getTasksForDate(date);
                      const hasHighPriority = dayTasks.some(task => task.priority === 'high');
                      const hasOverdue = dayTasks.some(task => 
                        !task.completed && task.dueDate < new Date()
                      );

                      return (
                        <div
                          className={cn(
                            'relative p-2 cursor-pointer hover:bg-accent rounded-md transition-colors',
                            isSameDay(date, selectedDate || new Date()) && 'bg-primary text-primary-foreground',
                            dayTasks.length > 0 && 'bg-accent/50'
                          )}
                          onClick={() => setSelectedDate(date)}
                          {...props}
                        >
                          <span className="text-sm">{format(date, 'd')}</span>
                          {dayTasks.length > 0 && (
                            <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                              {dayTasks.slice(0, 3).map((task, index) => (
                                <div
                                  key={task.id}
                                  className={cn(
                                    'h-1 rounded-full flex-1',
                                    courseColors[task.courseType],
                                    hasHighPriority && 'bg-destructive',
                                    hasOverdue && 'bg-destructive animate-pulse'
                                  )}
                                />
                              ))}
                              {dayTasks.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{dayTasks.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  }}
                />
              )}

              {viewMode === 'agenda' && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTasks
                    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                    .map(task => (
                      <div
                        key={task.id}
                        className={cn(
                          'p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors border-l-4',
                          priorityColors[task.priority]
                        )}
                        onClick={() => onTaskSelect?.(task)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">{task.course}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {format(task.dueDate, 'MMM d')}
                            </p>
                            <Badge className={courseColors[task.courseType]}>
                              {task.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Tasks */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? format(selectedDate, 'EEEE, MMMM d')
                  : 'Select a date'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No tasks scheduled for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map(task => (
                    <div
                      key={task.id}
                      className={cn(
                        'p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors border-l-4',
                        priorityColors[task.priority],
                        task.completed && 'opacity-60'
                      )}
                      onClick={() => onTaskSelect?.(task)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className={cn(
                            'font-medium text-sm',
                            task.completed && 'line-through'
                          )}>
                            {task.title}
                          </h4>
                          <Badge 
                            className={cn('text-xs', courseColors[task.courseType])}
                          >
                            {task.course}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{task.type}</span>
                          <span className={cn(
                            'font-medium',
                            task.priority === 'high' && 'text-destructive',
                            task.priority === 'medium' && 'text-warning',
                            task.priority === 'low' && 'text-success'
                          )}>
                            {task.priority} priority
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Tasks</span>
                  <span className="font-medium">{filteredTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium text-success">
                    {filteredTasks.filter(t => t.completed).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">High Priority</span>
                  <span className="font-medium text-destructive">
                    {filteredTasks.filter(t => t.priority === 'high' && !t.completed).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Overdue</span>
                  <span className="font-medium text-destructive">
                    {filteredTasks.filter(t => !t.completed && t.dueDate < new Date()).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}