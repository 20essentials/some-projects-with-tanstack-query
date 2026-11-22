---
name: add-code-from-tanstack-as-a-project
description: Añade un ejemplo oficial de TanStack Query para React a src/projects/{name}, adaptándolo como componente autónomo y registrándolo en el catálogo del proyecto.
---

# Añadir un ejemplo de TanStack Query como proyecto

Usa este procedimiento cuando el usuario solicite añadir un ejemplo oficial de TanStack Query para React a este proyecto. El resultado debe ser un componente React autónomo en `src/projects/{name}/index.tsx`, no una copia del proyecto original.

## 1. Elegir y nombrar el ejemplo

- Si el usuario proporciona una URL de ejemplo, ese ejemplo ya está decidido: no preguntes cuál quiere, no sugieras alternativas y no reemplaces el ejemplo por `simple`.
- Si no proporciona una URL, pregunta qué ejemplo quiere antes de continuar.
- Acepta enlaces a la documentación, por ejemplo `https://tanstack.com/query/latest/docs/framework/react/examples/auto-refetching`, o enlaces directos de GitHub, por ejemplo `https://github.com/tanstack/query/tree/main/examples/react/auto-refetching`.
- Si la URL está acompañada de texto, extrae la URL. Quita la barra final, los parámetros de consulta y cualquier fragmento; el último segmento de la ruta es el nombre del ejemplo.
- Normaliza `{name}` como un slug en minúsculas con guiones. Usa ese nombre para la carpeta y el registro.

## 2. Obtener el código oficial

- Normaliza la fuente del ejemplo a `https://github.com/TanStack/query/tree/main/examples/react/{name}` y comprueba su estructura y archivos. No supongas que todos los ejemplos usan el mismo framework o ruta.
- Prefiere leer archivos RAW de `https://raw.githubusercontent.com/TanStack/query/main/examples/react/{name}/...`.
- En ejemplos Vite, el punto de entrada suele ser `src/index.tsx`; en ejemplos Next.js puede ser `src/pages/index.tsx`. Inspecciona el árbol del directorio y ajusta la ruta al archivo real.
- Lee el `package.json` del ejemplo para identificar versiones y dependencias. Si la lógica se reparte entre varios archivos de `src/`, obtén los necesarios y decide qué lógica debe integrarse en el componente.
- Adapta solo el código necesario para demostrar el uso de TanStack Query; no copies el proyecto completo.

## 3. Crear el componente

Crea `src/projects/{name}/index.tsx`, creando el directorio si hace falta y reemplazando el archivo existente si ya está presente.

- Conserva la lógica esencial de TanStack Query: hooks como `useQuery`, `useMutation`, `useInfiniteQuery` y `useQueryClient`; `queryKey` y `queryFn`; configuración del `QueryClient` y `QueryClientProvider`; y estados de renderizado como `isPending`, `error`, `data` e `isFetching`.
- Elimina el bootstrap de ReactDOM, incluidos `ReactDOM.createRoot(...)`, `document.getElementById('root')` y el montaje de `<App />`. Deja el componente exportado para que Astro lo monte; no montes directamente en el DOM desde `src/projects/*`.
- Elimina lo específico de Next.js que no aplique, como `next/link`, `next/router`, rutas basadas en archivos, middleware y configuración de Next.js. Sustituye enlaces o transiciones por elementos nativos cuando corresponda.
- No copies endpoints de API del ejemplo. Si una query depende de una API local, sustitúyela por una API pública equivalente o un mock local en memoria que devuelva la misma forma de datos. Conserva la lógica de TanStack Query, incluidos `queryKey`, `pageParam` y `getNextPageParam`, y explica el cambio al usuario al terminar.
- Elimina imports que hayan quedado sin uso.
- No importes `* as React`. Con `jsx: react-jsx`, importa solo los valores o tipos de React que uses; no añadas un import de React si no hace falta.
- Para assets referenciados por el código, usa `baseUrl('/assets/...')` desde `@/utils/functions`. Comprueba si el asset existe en `public/assets/`; si no existe, omítelo o usa una URL remota estable. Respeta `astro.config.mjs`.
- No añadas comentarios al código generado. Usa `const` o `let`, nunca `var`.
- Mantén el nombre del componente exportado por defecto y los nombres de las funciones del ejemplo.
- Asegúrate de que el archivo sea TSX válido con el `tsconfig` del proyecto (`jsx: react-jsx` y alias `@/*`).
- Formatea cada archivo creado o modificado en `src/projects/*` con el formateador del proyecto.

## 4. Instalar dependencias necesarias

- Compara las dependencias del ejemplo con el `package.json` del proyecto. Añade solo las que falten y que use el componente adaptado; no instales Next.js, Vite, plugins de framework ni dependencias que ya no se utilicen.
- Usa siempre `pnpm` y fija versiones exactas, sin `^`. Prefiere la versión del ejemplo; si no está disponible, usa la versión disponible más reciente y exacta.
- Por ejemplo: `pnpm add @tanstack/react-query@5.103.1 @tanstack/react-query-devtools@5.103.1`.

## 5. Registrar el proyecto

En `src/utils/array-of-projects.ts`, añade un elemento al array `projects` con la forma existente:

```ts
{
  urlFile: baseUrl('/{name}'),
  titleProject: 'Title',
}
```

- Convierte el slug `{name}` a un título legible capitalizando cada palabra separada por guiones; por ejemplo, `load-more-infinite-scroll` se convierte en `Load More Infinite Scroll`.
- Respeta el formato actual del archivo y no dupliques un ejemplo ya registrado.

## 6. Verificar y reportar

- Ejecuta `pnpm build` y corrige cualquier error causado por la adaptación, incluso si el proyecto no se usa todavía en una página.
- Al terminar, informa brevemente el nombre derivado de la URL, el archivo fuente de GitHub, las dependencias añadidas con versiones exactas, las adaptaciones relevantes (bootstrap, Next.js, API o assets) y el resultado del build.
- No pidas confirmación al final si el usuario ya especificó el ejemplo.
