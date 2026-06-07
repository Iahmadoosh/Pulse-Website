import { Employee, Department } from "./types";

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: "DEP-001", name: "Engineering", manager: "Bob Smith", description: "Software development and infrastructure" },
  { id: "DEP-002", name: "Design", manager: "Emily Chen", description: "Product design and user experience" },
  { id: "DEP-003", name: "Marketing", manager: "Jessica Ross", description: "Growth, content, and brand marketing" }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-001",
    name: "Alice Smith",
    title: "Software Engineer",
    department: "Engineering",
    tenure_years: 3.5,
    kpi_score_out_of_100: 85,
    notes: [
      { id: "n1", author: "Bob (Manager)", date: "2026-01-15", content: "Great team player, mentors juniors proactively." },
      { id: "n2", author: "Charlie (Tech Lead)", date: "2026-04-10", content: "Sometimes struggles with strict delivery deadlines but communication is excellent." }
    ],
    availability: "Monday to Friday, 9 AM - 5 PM",
    hourly_wage: 45,
    vacation_days: 15,
    sick_days: 5
  },
  {
    id: "EMP-002",
    name: "David Chen",
    title: "Senior Developer",
    department: "Engineering",
    tenure_years: 2.0,
    kpi_score_out_of_100: 98,
    notes: [
      { id: "n3", author: "Bob (Manager)", date: "2026-05-01", content: "Brilliant coder, delivers projects incredibly fast. However, can be abrasive in code reviews, dismissive of feedback, and has caused friction with the QA team." }
    ],
    availability: "Flexible, prefers evenings and weekends",
    hourly_wage: 65,
    vacation_days: 20,
    sick_days: 3
  },
  {
    id: "EMP-003",
    name: "Sarah Jenkins",
    title: "Product Designer",
    department: "Design",
    tenure_years: 4.2,
    kpi_score_out_of_100: 60,
    notes: [
      { id: "n4", author: "Emily (Director)", date: "2026-05-10", content: "Historically a top performer, but engagement has dropped significantly over the last 6 months. Taking frequent unplanned time off. Seems burnt out." }
    ],
    availability: "Monday, Wednesday, Friday, 10 AM - 4 PM",
    hourly_wage: 50,
    vacation_days: 12,
    sick_days: 8
  },
  {
    id: "EMP-004",
    name: "Michael Ross",
    title: "Marketing Lead",
    department: "Marketing",
    tenure_years: 1.5,
    kpi_score_out_of_100: 92,
    notes: [
      { id: "n5", author: "Jessica (CMO)", date: "2026-05-12", content: "Highly creative and boosts team morale. Often takes on too much work and is currently showing signs of fatigue. Missed two meetings this week." }
    ],
    availability: "Tuesday to Saturday, 8 AM - 4 PM",
    hourly_wage: 55,
    vacation_days: 10,
    sick_days: 2
  }
];
