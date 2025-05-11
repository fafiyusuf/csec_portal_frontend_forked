// Session-related types
export interface Session {
  _id: string;
  sessionTitle: string;
  division: string;
  groups: string[];
  startDate: string;
  endDate: string;
  sessions: SessionTime[];
  status: string;
}

export interface SessionTime {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
}

// Member-related types
export interface Member {
  _id: string;
  firstName?: string;
  lastName?: string;
  division: string;
  group: string;
  attendance?: "Present" | "Absent" | "Excused" | null;
  excused?: boolean;
  headsUpNote?: string;
}

// Attendance record for a single session
export interface AttendanceRecord {
  _id: string;
  date: string;
  status: "Present" | "Absent" | "Excused";
  sessionTitle: string;
  day: string;
  startTime: string;
  endTime: string;
  headsUp?: string;
}

// Period-specific scope (week, month, overall)
export interface AttendanceScope {
  percentage: number;
  total: number;
  present: number;
  headsUp: {
    count: number;
    percentage: number;
  };
  records: AttendanceRecord[];
}

// Full member attendance data
export interface MemberAttendanceRecords {
  week: AttendanceScope;
  month: AttendanceScope;
  overall: AttendanceScope;
}

// Submission used when updating attendance
export interface AttendanceSubmission {
  sessionId: string;
  records: {
    memberId: string;
    status: "Present" | "Absent" | "Excused";
    excused: boolean;
    headsUp?: string;
  }[];
}