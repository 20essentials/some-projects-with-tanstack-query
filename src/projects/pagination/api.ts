export interface Project {
  name: string;
  id: number;
}

export interface ProjectsPage {
  projects: Array<Project>;
  hasMore: boolean;
}

const pageSize = 10;
const totalPages = 10;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchProjects = async (page = 0): Promise<ProjectsPage> => {
  const projects: Array<Project> = Array.from({ length: pageSize }, (_, i) => {
    const id = page * pageSize + (i + 1);
    return { name: `Project ${id}`, id };
  });

  await delay(1000);

  return { projects, hasMore: page < totalPages - 1 };
};
