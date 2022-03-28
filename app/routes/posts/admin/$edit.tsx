import {
  ActionFunction,
  Form,
  json,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import { deletePost, Post, updatePost } from "~/models/post.server";
import { getPost } from "~/models/post.server";
import invariant from "tiny-invariant";

type LoaderData = { post: Post };
export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.edit, `params.edit is required`);

  const post = await getPost(params.edit);
  invariant(post, `Post not found: ${params.edit}`);

  return json<LoaderData>({ post });
};

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const action = formData.get("action");
  const slug = formData.get("slug");
  invariant(typeof slug === "string", "slug must be a string");

  switch (action) {
    case "update":
      const title = formData.get("title");
      const markdown = formData.get("markdown");
      const id = formData.get("old-slug");

      const errors: ActionData = {
        title: title ? null : "Title is required",
        slug: slug ? null : "Slug is required",
        markdown: markdown ? null : "Markdown is required",
      };
      const hasErrors = Object.values(errors).some(
        (errorMessage) => errorMessage
      );
      if (hasErrors) {
        return json<ActionData>(errors);
      }
      invariant(typeof title === "string", "title must be a string");
      invariant(typeof slug === "string", "slug must be a string");
      invariant(typeof markdown === "string", "markdown must be a string");
      invariant(typeof id === "string", "id must be a string");

      await updatePost({ title, slug, markdown, id });
    case "delete":
      await deletePost(slug);
  }

  return redirect("/posts/admin");
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function EditPost() {
  const errors = useActionData();
  const { post } = useLoaderData() as LoaderData;

  const transition = useTransition();
  const isCreating = Boolean(transition.submission);

  return (
    <Form method="post" key={post.slug}>
      <input type="hidden" name="old-slug" defaultValue={post.slug} />
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            defaultValue={post.title}
            className={inputClassName}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input
            type="text"
            name="slug"
            defaultValue={post.slug}
            className={inputClassName}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:{" "}
          {errors?.markdown ? (
            <em className="text-red-600">{errors.markdown}</em>
          ) : null}
        </label>
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          defaultValue={post.markdown}
          className={`${inputClassName} font-mono`}
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          className="mr-6 rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
          disabled={isCreating}
          name="action"
          value="delete"
        >
          {isCreating ? "Deleting..." : "Delete Post"}
        </button>
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating}
          name="action"
          value="update"
        >
          {isCreating ? "Editing..." : "Edit Post"}
        </button>
      </p>
    </Form>
  );
}
