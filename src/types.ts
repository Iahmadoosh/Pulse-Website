export type Department = {
  id: string;
  name: string;
  manager: string;
  description: string;
};

export type Note = {
  id: string;
  author: string;
  date: string;
  content: string;
};

export type Employee = {
  id: string;
  name: string;
  title: string;
  department: string;
  tenure_years: number;
  kpi_score_out_of_100: number;
  notes: Note[];
  availability: string;
  hourly_wage: number;
  vacation_days: number;
  sick_days: number;
};
