import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Clock, 
  Plus,
  Edit3,
  Calendar,
  BarChart3 
} from 'lucide-react';
import { Task, Milestone } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ProgressMonitoringProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export function ProgressMonitoring({ tasks, onTaskUpdate }: ProgressMonitoringProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  // Calculate overall progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Get tasks grouped by progress
  const tasksInProgress = tasks.filter(t => !t.completed && t.progress > 0);
  const completedProjects = tasks.filter(t => t.completed && t.type === 'project');
  const upcomingDeadlines = tasks
    .filter(t => !t.completed)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  const updateTaskProgress = (taskId: string, progress: number) => {
    onTaskUpdate(taskId, { progress });
  };

  const toggleMilestone = (taskId: string, milestoneId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedMilestones = task.milestones.map(milestone =>
      milestone.id === milestoneId
        ? { ...milestone, completed: !milestone.completed }
        : milestone
    );

    // Calculate new progress based on completed milestones
    const completedMilestones = updatedMilestones.filter(m => m.completed).length;
    const newProgress = updatedMilestones.length > 0 
      ? (completedMilestones / updatedMilestones.length) * 100 
      : task.progress;

    onTaskUpdate(taskId, { 
      milestones: updatedMilestones,
      progress: Math.round(newProgress)
    });
  };

  const addMilestone = (taskId: string) => {
    if (!newMilestoneTitle.trim()) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
      completed: false,
      progress: 0
    };

    onTaskUpdate(taskId, {
      milestones: [...task.milestones, newMilestone]
    });

    setNewMilestoneTitle('');
    setShowMilestoneDialog(false);
  };

  const courseColors = {
    math: 'bg-course-math',
    science: 'bg-course-science',
    english: 'bg-course-english',
    history: 'bg-course-history',
    other: 'bg-course-other'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Progress Monitoring</h2>
      </div>

      {/* Overall Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">out of {totalTasks} tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{tasksInProgress.length}</div>
            <p className="text-xs text-muted-foreground">tasks started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Done</CardTitle>
            <Target className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground">major projects</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Progress List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Task Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.filter(t => !t.completed).map(task => (
                  <div key={task.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={courseColors[task.courseType]}>
                            {task.course}
                          </Badge>
                          <Badge variant="outline">{task.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Due: {format(task.dueDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">{task.progress}%</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => setSelectedTask(task)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <Progress value={task.progress} className="h-2" />
                    
                    {/* Quick Progress Buttons */}
                    <div className="flex gap-2">
                      {[25, 50, 75, 100].map(value => (
                        <Button
                          key={value}
                          variant="outline"
                          size="sm"
                          className={cn(
                            'text-xs',
                            task.progress >= value && 'bg-primary/10 text-primary'
                          )}
                          onClick={() => updateTaskProgress(task.id, value)}
                        >
                          {value}%
                        </Button>
                      ))}
                    </div>
                    
                    {/* Milestones Preview */}
                    {task.milestones.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium">Milestones:</p>
                        <div className="space-y-1">
                          {task.milestones.slice(0, 3).map(milestone => (
                            <div key={milestone.id} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={milestone.completed}
                                onCheckedChange={() => toggleMilestone(task.id, milestone.id)}
                              />
                              <span className={cn(
                                milestone.completed && 'line-through text-muted-foreground'
                              )}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                          {task.milestones.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{task.milestones.length - 3} more milestones
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.map(task => {
                  const daysUntil = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={task.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.course}</p>
                      </div>
                      <Badge variant={daysUntil <= 3 ? 'destructive' : daysUntil <= 7 ? 'default' : 'secondary'}>
                        {daysUntil <= 0 ? 'Overdue' : `${daysUntil}d`}
                      </Badge>
                    </div>
                  );
                })}
                {upcomingDeadlines.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming deadlines
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Not Started</span>
                  <span className="font-medium">
                    {tasks.filter(t => !t.completed && t.progress === 0).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="font-medium">
                    {tasks.filter(t => !t.completed && t.progress > 0 && t.progress < 100).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Near Completion</span>
                  <span className="font-medium">
                    {tasks.filter(t => !t.completed && t.progress >= 75).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="font-medium text-success">{completedTasks}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTask.title} - Progress Details</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Current Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Overall Progress</Label>
                  <span className="text-lg font-bold">{selectedTask.progress}%</span>
                </div>
                <Progress value={selectedTask.progress} className="h-3" />
                <div className="flex gap-2 mt-2">
                  {[0, 25, 50, 75, 100].map(value => (
                    <Button
                      key={value}
                      variant={selectedTask.progress === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateTaskProgress(selectedTask.id, value)}
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Milestones</Label>
                  <Button
                    size="sm"
                    onClick={() => setShowMilestoneDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedTask.milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={milestone.completed}
                        onCheckedChange={() => toggleMilestone(selectedTask.id, milestone.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className={cn(
                          'font-medium',
                          milestone.completed && 'line-through text-muted-foreground'
                        )}>
                          {milestone.title}
                        </p>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {format(milestone.dueDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {selectedTask.milestones.length === 0 && (
                    <p className="text-center text-muted-foreground py-6">
                      No milestones yet. Add some to track your progress!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Milestone Dialog */}
      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-title">Milestone Title</Label>
              <Input
                id="milestone-title"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Enter milestone title..."
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowMilestoneDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedTask && addMilestone(selectedTask.id)}
                disabled={!newMilestoneTitle.trim()}
              >
                Add Milestone
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}