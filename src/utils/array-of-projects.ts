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
  },
  {
    urlFile: baseUrl('/auto-refetching'),
    titleProject: 'Auto Refetching'
  },
  {
    urlFile: baseUrl('/nextjs-app-optimistic-updates'),
    titleProject: 'Nextjs App Optimistic Updates'
  },
  {
    urlFile: baseUrl('/pagination'),
    titleProject: 'Pagination'
  },
  {
    urlFile: baseUrl('/load-more-infinite-scroll'),
    titleProject: 'Load More Infinite Scroll'
  }
];
