export const ADMIN_MENU = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    roles: [
      "SUPER_ADMIN",
      "CENTRAL_ADMIN",
      "STATE_ADMIN",
      "DISTRICT_ADMIN",
      "DEPT_HEAD",
      "OFFICER",
      "WORKER",
    ],
  },
  {
    label: "Complaints",
    path: "/admin/complaints",
    roles: [
      "SUPER_ADMIN",
      "CENTRAL_ADMIN",
      "STATE_ADMIN",
      "DISTRICT_ADMIN",
      "DEPT_HEAD",
      "OFFICER",
    ],
  },
  {
    label: "Departments",
    path: "/admin/departments",
    roles: ["SUPER_ADMIN", "CENTRAL_ADMIN"],
  },
  {
    label: "Reports",
    path: "/admin/reports",
    roles: ["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"],
  },
  {
    label: "Admins",
    path: "/admin/users",
    roles: ["SUPER_ADMIN", "CENTRAL_ADMIN", "STATE_ADMIN", "DISTRICT_ADMIN"],
    },
];
