import { json, Link, useLoaderData } from "remix";
import { getPosts } from "~/models/post.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader = async () => {
  return json<LoaderData>({
    posts: await getPosts(),
  });
};

export default function Posts() {
  const { posts } = useLoaderData<LoaderData>();

  return (
    <main className="mx-auto max-w-4xl">
      <Link to="admin" className="text-red-600 underline">
        Admin
      </Link>
      <h1 className="my-6 border-b-2 text-center text-3xl">Posts</h1>
      <ul>
        {posts.map((post: any) => (
          <li key={post.slug}>
            <Link to={post.slug} className="text-blue-600 underline">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
