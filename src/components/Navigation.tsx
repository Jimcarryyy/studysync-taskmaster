import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  Timer, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  FileText,
  Bell,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type View = 
  | 'dashboard' 
  | 'calendar' 
  | 'progress' 
  | 'pomodoro' 
  | 'grades' 
  | 'resources' 
  | 'analytics' 
  | 'templates'
  | 'planner';

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  unreadNotifications?: number;
}

const navigationItems = [
  { 
    id: 'dashboard' as View, 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    description: 'Overview and task management'
  },
  { 
    id: 'calendar' as View, 
    label: 'Calendar', 
    icon: Calendar,
    description: 'Monthly and weekly views'
  },
  { 
    id: 'progress' as View, 
    label: 'Progress', 
    icon: BarChart3,
    description: 'Track milestones and completion'
  },
  { 
    id: 'planner' as View, 
    label: 'Time Planner', 
    icon: Timer,
    description: 'Schedule study sessions'
  },
  { 
    id: 'pomodoro' as View, 
    label: 'Focus Timer', 
    icon: Timer,
    description: 'Pomodoro productivity timer'
  },
  { 
    id: 'grades' as View, 
    label: 'Grades', 
    icon: GraduationCap,
    description: 'Track grades and GPA'
  },
  { 
    id: 'resources' as View, 
    label: 'Resources', 
    icon: BookOpen,
    description: 'Course materials and files'
  },
  { 
    id: 'analytics' as View, 
    label: 'Analytics', 
    icon: TrendingUp,
    description: 'Productivity insights'
  },
  { 
    id: 'templates' as View, 
    label: 'Templates', 
    icon: FileText,
    description: 'Task templates and presets'
  }
];

export function Navigation({ currentView, onViewChange, unreadNotifications = 0 }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      'bg-card border-r border-border transition-all duration-300 flex flex-col',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold bg-primary-gradient bg-clip-text text-transparent">
                TaskMaster
              </h1>
              <p className="text-xs text-muted-foreground">Academic Task Manager</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {!isCollapsed && unreadNotifications > 0 && (
        <div className="p-3 m-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {unreadNotifications} unread notification{unreadNotifications !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 transition-colors',
                isCollapsed ? 'px-2' : 'px-3',
                isActive && 'bg-primary/10 text-primary border border-primary/20'
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className={cn('h-4 w-4', isActive && 'text-primary')} />
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{item.label}</div>
                  {!isActive && (
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  )}
                </div>
              )}
              {!isCollapsed && item.id === 'dashboard' && unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground text-center">
            <p>Built for Academic Success</p>
            <p className="mt-1">Version 1.0</p>
          </div>
        )}
      </div>
    </div>
  );
}