export interface Project {
  name: string;
  id: number;
}

export interface ProjectsPage {
  data: Array<Project>;
  previousId: number | null;
  nextId: number | null;
}

const pageSize = 5;
const minCursor = -10;
const maxCursor = 10;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchProjectsPage = async (
  cursor: number
): Promise<ProjectsPage> => {
  const data: Array<Project> = Array.from({ length: pageSize }, (_, i) => ({
    name: `Project ${i + cursor} (server time: ${Date.now()})`,
    id: i + cursor
  }));

  const nextId = cursor < maxCursor ? data[data.length - 1].id + 1 : null;
  const previousId = cursor > minCursor ? data[0].id - pageSize : null;

  await delay(1000);

  return { data, nextId, previousId };
};
