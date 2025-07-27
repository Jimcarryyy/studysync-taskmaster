import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskCard, Task } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Plus, Filter, CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Calculus Problem Set 3',
      description: 'Complete problems 1-15 from chapter 4, focusing on derivatives and limits.',
      course: 'MATH 101',
      courseType: 'math',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      priority: 'high',
      completed: false,
      type: 'assignment'
    },
    {
      id: '2', 
      title: 'Chemistry Lab Report',
      description: 'Analyze results from acid-base titration experiment.',
      course: 'CHEM 201',
      courseType: 'science',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      priority: 'medium',
      completed: false,
      type: 'assignment'
    },
    {
      id: '3',
      title: 'Shakespeare Essay',
      description: 'Analysis of themes in Hamlet - 1500 words minimum.',
      course: 'ENG 102',
      courseType: 'english', 
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      priority: 'medium',
      completed: true,
      type: 'assignment'
    },
    {
      id: '4',
      title: 'Midterm Exam',
      description: 'World War II and Cold War era - chapters 12-16.',
      course: 'HIST 150',
      courseType: 'history',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      priority: 'high',
      completed: false,
      type: 'exam'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'course'>('dueDate');
  const [filterBy, setFilterBy] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const { toast } = useToast();

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Apply filters
    switch (filterBy) {
      case 'pending':
        filtered = tasks.filter(task => !task.completed);
        break;
      case 'completed':
        filtered = tasks.filter(task => task.completed);
        break;
      case 'overdue':
        filtered = tasks.filter(task => !task.completed && task.dueDate < new Date());
        break;
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'course':
          return a.course.localeCompare(b.course);
        default:
          return 0;
      }
    });
  }, [tasks, sortBy, filterBy]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(task => !task.completed && task.dueDate < new Date()).length;
    
    return { total, completed, pending, overdue };
  }, [tasks]);

  const handleCreateTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString()
    };
    setTasks(prev => [...prev, newTask]);
    toast({
      title: "Task created",
      description: "Your new task has been added successfully.",
    });
  };

  const handleEditTask = (taskData: Omit<Task, 'id'>) => {
    if (!editingTask) return;
    
    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...taskData, id: editingTask.id }
        : task
    ));
    setEditingTask(null);
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    });
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, completed: !task.completed }
        : task
    ));
    
    const task = tasks.find(t => t.id === id);
    if (task) {
      toast({
        title: task.completed ? "Task marked as pending" : "Task completed!",
        description: task.completed 
          ? "Task moved back to pending." 
          : "Great job on completing your task!",
      });
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: "Task deleted",
      description: "The task has been removed from your list.",
      variant: "destructive",
    });
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-primary-gradient bg-clip-text text-transparent">
              TaskMaster
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay on top of your academic goals
            </p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-primary-gradient hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
            <Select value={filterBy} onValueChange={(value: typeof filterBy) => setFilterBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="course">Course</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredAndSortedTasks.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                <p>
                  {filterBy === 'all' 
                    ? "Get started by creating your first task!"
                    : `No ${filterBy} tasks at the moment.`
                  }
                </p>
              </div>
            </Card>
          ) : (
            filteredAndSortedTasks.map((task, index) => (
              <div 
                key={task.id} 
                className="animate-slide-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TaskCard
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTask}
                />
              </div>
            ))
          )}
        </div>

        {/* Task Form Modal */}
        <TaskForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={editingTask ? handleEditTask : handleCreateTask}
          editingTask={editingTask}
        />
      </div>
    </div>
  );
}