export type Session = {
  _id?: string;
  sessionTitle: string;
  division: string;
  startDate: string;
  endDate: string;
  groups: string[];
  sessions: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
};

export type Event = {
  _id?: string;
  eventTitle: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  visibility: string;
};