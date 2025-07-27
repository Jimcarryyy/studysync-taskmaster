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
  
  // Progress tracking
  progress: number; // 0-100
  milestones: Milestone[];
  estimatedHours?: number;
  actualHours?: number;
  
  // Grade tracking
  grade?: number;
  maxGrade?: number;
  gradeType?: 'percentage' | 'points' | 'letter';
  
  // Resources
  resources: Resource[];
  
  // Collaboration
  collaborators: string[];
  isGroupProject: boolean;
  
  // Time management
  studySessions: StudySession[];
  reminderTime?: Date;
  
  // Tags
  tags: string[];
  
  // Template
  templateId?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  progress: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'link' | 'file' | 'note';
  url?: string;
  content?: string;
  uploadDate: Date;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date;
  plannedDuration: number; // minutes
  actualDuration: number; // minutes
  type: 'study' | 'break';
  completed: boolean;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  type: 'math' | 'science' | 'english' | 'history' | 'other';
  color: string;
  instructor?: string;
  credits?: number;
  currentGrade?: number;
  targetGrade?: number;
}

export interface Grade {
  id: string;
  taskId: string;
  courseId: string;
  grade: number;
  maxGrade: number;
  weight: number; // percentage of final grade
  type: 'assignment' | 'exam' | 'quiz' | 'project';
  date: Date;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  type: 'assignment' | 'project' | 'exam' | 'quiz';
  defaultDuration: number; // hours
  defaultPriority: 'low' | 'medium' | 'high';
  milestoneTemplates: Omit<Milestone, 'id' | 'completed' | 'progress'>[];
  requiredFields: string[];
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  type: 'work' | 'break';
  completed: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'reminder' | 'completion' | 'grade';
  taskId?: string;
  date: Date;
  read: boolean;
}