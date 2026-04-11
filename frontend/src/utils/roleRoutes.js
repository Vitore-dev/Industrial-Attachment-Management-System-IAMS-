export const getHomeRouteForRole = (role) => {
  switch (role) {
    case 'coordinator':
      return '/dashboard';
    case 'student':
      return '/student/profile';
    case 'organization':
      return '/organization/profile';
    case 'university_supervisor':
    case 'industrial_supervisor':
      return '/supervisor';
    default:
      return '/login';
  }
};

export const getRegistrationRouteForRole = (role) => {
  switch (role) {
    case 'student':
      return '/student/setup';
    case 'organization':
      return '/organization/setup';
    default:
      return getHomeRouteForRole(role);
  }
};
