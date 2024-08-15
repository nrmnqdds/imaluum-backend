export type Subject = {
  sessionName?: string;
  id: string;
  courseCode: string;
  courseName: string;
  section: string;
  chr: string;
  timestamps: WeekTime;
  venue: string;
  lecturer: string;
};

export type WeekTime = {
  start: string;
  end: string;
  day: number;
};

export type TimetableConfig = {
  startDay: number;
  endDay: number;
  startHour: number;
  endHour: number;
};

export type Courses = {
  schedule: Subject[];
  sessionName: string;
  sessionQuery: string;
};

export type Cgpa = {
  sessionName: string;
  gpaValue: string;
  cgpaValue: string;
};

export type Result = {
  sessionName: string;
  sessionQuery: string;
  gpaValue: string;
  cgpaValue: string;
  status: string;
  remarks: string;
  result: {
    courseCode: string;
    courseName: string;
    courseGrade: string;
    courseCredit: string;
  }[];
};
