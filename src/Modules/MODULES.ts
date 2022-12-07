import notesImage from "../assets/images/notes.png";
import tasksImage from "../assets/images/to-do-list.png";
import filesImage from "../assets/images/drawer.png";
import checklistImage from "../assets/images/checklist.png";
import utensilsImage from "../assets/images/spatula.png";
import shceduleImage from "../assets/images/timetable.png";
import employeesImage from "../assets/images/hierarchy.png";
import myShiftsImage from "../assets/images/my_Shifts.png";

export type ModuleType = {
  name: string;
  path: string;
  icon: any;
  description: string;
  badge?: "conv" | "task" | "sch";
  shortDescription: string;
};

export const baseModules: ModuleType[] = [
  {
    name: "My Shifts",
    path: "my-shifts",
    icon: myShiftsImage,
    description:
      "See your assigned shifts and know when you need to come to work.",
    badge: "sch",
    shortDescription: "See your schedule",
  },
  {
    name: "Notes",
    path: "notes",
    icon: notesImage,
    description:
      "Create important notes and store text information that your whole team can read from their devices.",
    shortDescription: "Gather Useful Information",
  },
  {
    name: "Tasks",
    path: "to-do",
    icon: tasksImage,
    description:
      "Assign Tasks to your team or create your own tasks. Complete steps toward a better restaurant.",
    badge: "task",
    shortDescription: "Increase Productivity",
  },
  {
    name: "Files",
    path: "storage",
    icon: filesImage,
    description: "Distribute your files on drawers that your team can access.",
    shortDescription: "Store and share files",
  },
  {
    name: "Daily Checklists",
    path: "lochecklist",
    icon: checklistImage,
    description: "Create daily Checklists that keep the bar raised.",
    shortDescription: "Define periodic tasks",
  },
];

export const adminModules: ModuleType[] = [
  {
    name: "Employees",
    path: "employees",
    icon: employeesImage,
    description:
      "Manage your team, onboard employees, assign wages, positions, access documents and much more.",
    shortDescription: "Manage your team",
  },
  {
    name: "Schedule",
    path: "schedule",
    icon: shceduleImage,
    description: "Assign shifts for your team and organize your week.",
    shortDescription: "Distribute Shifts",
  },
  {
    name: "Utensils",
    path: "utensils",
    icon: utensilsImage,
    description:
      "Keep track of the state of your utensils. Know when you need to purchase new utensils.",
    shortDescription: "Keep track of your utensils",
  },
];
