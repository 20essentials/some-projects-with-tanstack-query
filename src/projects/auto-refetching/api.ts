let list: Array<string> = ['Item 1', 'Item 2', 'Item 3'];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getTodos = async (): Promise<Array<string>> => {
  await delay(100);
  return [...list];
};

export const addTodo = async (add: string): Promise<Array<string>> => {
  if (!list.includes(add)) {
    list = [...list, add];
  }
  return await getTodos();
};

export const clearTodos = async (): Promise<Array<string>> => {
  list = [];
  return await getTodos();
};
