// site/my-app/functions/hello.ts
export const onRequestGet: PagesFunction = async () =>
  new Response("hello from pages functions", { headers: { "content-type": 
"text/plain" } });

