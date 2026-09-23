const baseUrl = (path: string) =>
  `https://github.com/20essentials/some-projects-with-tanstack-query/blob/main/src/projects${path}/index.tsx`;

export const projects = [
  {
    urlFile: baseUrl('/basic'),
    titleProject: 'Basic'
  },
  {
    urlFile: baseUrl('/simple'),
    titleProject: 'Simple'
  }
];
