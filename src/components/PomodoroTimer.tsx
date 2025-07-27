import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Coffee, 
  BookOpen, 
  Clock,
  Settings,
  TrendingUp 
} from 'lucide-react';
import { Task, PomodoroSession } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PomodoroTimerProps {
  tasks: Task[];
  onSessionComplete?: (session: PomodoroSession) => void;
}

type TimerState = 'idle' | 'running' | 'paused' | 'break';
type SessionType = 'work' | 'shortBreak' | 'longBreak';

const DEFAULT_DURATIONS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15
};

export function PomodoroTimer({ tasks, onSessionComplete }: PomodoroTimerProps) {
  const [state, setState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.work * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>([]);
  
  const [customDurations, setCustomDurations] = useState(DEFAULT_DURATIONS);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const currentDuration = customDurations[sessionType === 'work' ? 'work' : sessionType === 'shortBreak' ? 'shortBreak' : 'longBreak'];
  const progress = ((currentDuration * 60 - timeLeft) / (currentDuration * 60)) * 100;

  useEffect(() => {
    if (state === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && state === 'running') {
      handleSessionComplete();
    }
  }, [timeLeft, state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (state === 'idle') {
      const newSession: PomodoroSession = {
        id: `session-${Date.now()}`,
        taskId: selectedTaskId || undefined,
        startTime: new Date(),
        duration: currentDuration,
        type: sessionType === 'work' ? 'work' : 'break',
        completed: false
      };
      setCurrentSession(newSession);
    }
    setState('running');
  };

  const handlePause = () => {
    setState('paused');
  };

  const handleStop = () => {
    setState('idle');
    setTimeLeft(currentDuration * 60);
    setCurrentSession(null);
  };

  const handleReset = () => {
    setState('idle');
    setTimeLeft(currentDuration * 60);
    setCurrentSession(null);
  };

  const handleSessionComplete = () => {
    if (currentSession) {
      const completedSession: PomodoroSession = {
        ...currentSession,
        endTime: new Date(),
        completed: true
      };
      
      setCompletedSessions(prev => [...prev, completedSession]);
      onSessionComplete?.(completedSession);
      
      // Show notification
      const isWorkSession = sessionType === 'work';
      toast({
        title: isWorkSession ? '🎉 Work Session Complete!' : '☕ Break Time Over!',
        description: isWorkSession 
          ? `Great job! Time for a ${sessionCount % 4 === 3 ? 'long' : 'short'} break.`
          : 'Ready to get back to work?',
      });
      
      // Auto-switch to next session type
      if (isWorkSession) {
        setSessionCount(prev => prev + 1);
        const nextBreak = (sessionCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setSessionType(nextBreak);
        setTimeLeft(customDurations[nextBreak] * 60);
      } else {
        setSessionType('work');
        setTimeLeft(customDurations.work * 60);
      }
    }
    
    setState('idle');
    setCurrentSession(null);
  };

  const getSessionTypeInfo = () => {
    switch (sessionType) {
      case 'work':
        return {
          icon: BookOpen,
          title: 'Work Session',
          color: 'text-primary',
          bgColor: 'bg-primary/10'
        };
      case 'shortBreak':
        return {
          icon: Coffee,
          title: 'Short Break',
          color: 'text-success',
          bgColor: 'bg-success/10'
        };
      case 'longBreak':
        return {
          icon: Coffee,
          title: 'Long Break',
          color: 'text-info',
          bgColor: 'bg-info/10'
        };
    }
  };

  const sessionInfo = getSessionTypeInfo();
  const Icon = sessionInfo.icon;

  const availableTasks = tasks.filter(task => !task.completed);
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  const todaysSessions = completedSessions.filter(session => {
    const today = new Date();
    const sessionDate = session.startTime;
    return sessionDate.toDateString() === today.toDateString();
  });

  const todaysWorkTime = todaysSessions
    .filter(session => session.type === 'work')
    .reduce((total, session) => total + session.duration, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Focus Timer</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className={cn('border-2', sessionInfo.bgColor)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon className={cn('h-6 w-6', sessionInfo.color)} />
                <span>{sessionInfo.title}</span>
                <Badge variant="outline" className="ml-auto">
                  Session #{sessionCount + 1}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold font-mono tracking-wider">
                  {formatTime(timeLeft)}
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              {/* Selected Task */}
              {sessionType === 'work' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Focus on task (optional):</label>
                  <Select 
                    value={selectedTaskId} 
                    onValueChange={setSelectedTaskId}
                    disabled={state === 'running'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task to focus on..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific task</SelectItem>
                      {availableTasks.map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          <div className="flex items-center gap-2">
                            <span>{task.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {task.course}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Timer Controls */}
              <div className="flex justify-center gap-3">
                {state === 'idle' && (
                  <Button onClick={handleStart} className="gap-2">
                    <Play className="h-4 w-4" />
                    Start
                  </Button>
                )}
                
                {state === 'running' && (
                  <Button onClick={handlePause} variant="outline" className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}
                
                {state === 'paused' && (
                  <Button onClick={handleStart} className="gap-2">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                )}
                
                {(state === 'running' || state === 'paused') && (
                  <Button onClick={handleStop} variant="destructive" className="gap-2">
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                )}
                
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Session Type Selector */}
              <div className="flex justify-center gap-2">
                <Button
                  variant={sessionType === 'work' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (state === 'idle') {
                      setSessionType('work');
                      setTimeLeft(customDurations.work * 60);
                    }
                  }}
                  disabled={state !== 'idle'}
                >
                  Work
                </Button>
                <Button
                  variant={sessionType === 'shortBreak' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (state === 'idle') {
                      setSessionType('shortBreak');
                      setTimeLeft(customDurations.shortBreak * 60);
                    }
                  }}
                  disabled={state !== 'idle'}
                >
                  Short Break
                </Button>
                <Button
                  variant={sessionType === 'longBreak' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (state === 'idle') {
                      setSessionType('longBreak');
                      setTimeLeft(customDurations.longBreak * 60);
                    }
                  }}
                  disabled={state !== 'idle'}
                >
                  Long Break
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Task Info */}
          {selectedTask && sessionType === 'work' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-medium">{selectedTask.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTask.course}</p>
                  {selectedTask.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedTask.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Badge>{selectedTask.type}</Badge>
                    <Badge variant="outline">{selectedTask.priority} priority</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sessions</span>
                <span className="font-medium">{todaysSessions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Focus Time</span>
                <span className="font-medium">{Math.round(todaysWorkTime)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Streak</span>
                <span className="font-medium">{sessionCount} sessions</span>
              </div>
            </CardContent>
          </Card>

          {/* Settings Panel */}
          {showSettings && (
            <Card>
              <CardHeader>
                <CardTitle>Timer Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Work Duration (minutes)</label>
                  <Select 
                    value={customDurations.work.toString()} 
                    onValueChange={(value) => setCustomDurations(prev => ({ ...prev, work: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Short Break (minutes)</label>
                  <Select 
                    value={customDurations.shortBreak.toString()} 
                    onValueChange={(value) => setCustomDurations(prev => ({ ...prev, shortBreak: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Long Break (minutes)</label>
                  <Select 
                    value={customDurations.longBreak.toString()} 
                    onValueChange={(value) => setCustomDurations(prev => ({ ...prev, longBreak: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {todaysSessions.slice(-5).reverse().map((session) => (
                  <div key={session.id} className="flex items-center justify-between text-sm p-2 bg-accent/50 rounded">
                    <div className="flex items-center gap-2">
                      {session.type === 'work' ? (
                        <BookOpen className="h-3 w-3 text-primary" />
                      ) : (
                        <Coffee className="h-3 w-3 text-success" />
                      )}
                      <span>{session.type === 'work' ? 'Work' : 'Break'}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {session.duration}m
                    </span>
                  </div>
                ))}
                {todaysSessions.length === 0 && (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    No sessions completed today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}