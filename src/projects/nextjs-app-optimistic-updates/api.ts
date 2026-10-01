export interface Todo {
  id: string;
  text: string;
  createdAt: number;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let todos: Array<Todo> = [
  {
    id: crypto.randomUUID(),
    text: 'Buy groceries',
    createdAt: Date.now() - 3000
  },
  {
    id: crypto.randomUUID(),
    text: 'Walk the dog',
    createdAt: Date.now() - 2000
  },
  {
    id: crypto.randomUUID(),
    text: 'Read a book',
    createdAt: Date.now() - 1000
  }
];

export const getTodos = async (): Promise<Array<Todo>> => {
  await delay(200);
  return [...todos];
};

export const addTodo = async (text: string): Promise<Todo> => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error('text is required');
  }

  await delay(500);

  if (Math.random() < 0.3) {
    throw new Error('Server error — please try again');
  }

  const newTodo: Todo = {
    id: crypto.randomUUID(),
    text: trimmedText,
    createdAt: Date.now()
  };

  todos = [...todos, newTodo];

  return newTodo;
};
