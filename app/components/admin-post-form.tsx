"use client";

import { useActionState } from "react";

import {
  createPostAction,
  updatePostAction,
  type AdminActionState,
} from "@/app/(english)/admin/actions";

type AdminPostFormProps = {
  mode: "create" | "edit";
  post?: {
    id: string;
    title: string;
    slug: string;
    body: string;
    category: string | null;
    status: "draft" | "published";
  };
};

const initialState: AdminActionState = { ok: false };

export default function AdminPostForm({ mode, post }: AdminPostFormProps) {
  const action = mode === "create" ? createPostAction : updatePostAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="admin-form">
      {mode === "edit" && post ? (
        <input type="hidden" name="id" value={post.id} />
      ) : null}

      <label className="admin-field">
        <span className="admin-field-label">Title</span>
        <input
          name="title"
          required
          defaultValue={post?.title ?? ""}
          className="admin-input"
        />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Slug</span>
        <input
          name="slug"
          required
          pattern="[a-z0-9-]+"
          title="Lowercase letters, numbers, and hyphens only"
          defaultValue={post?.slug ?? ""}
          className="admin-input is-mono"
        />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Category (optional)</span>
        <input
          name="category"
          defaultValue={post?.category ?? ""}
          className="admin-input"
        />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Status</span>
        <select
          name="status"
          defaultValue={post?.status ?? "draft"}
          className="admin-select"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Body (Markdown)</span>
        <textarea
          name="body"
          required
          rows={18}
          defaultValue={post?.body ?? ""}
          className="admin-textarea"
        />
      </label>

      {state.error ? (
        <p className="admin-message is-error" role="alert">
          {state.error}
        </p>
      ) : null}

      {state.ok ? (
        <p className="admin-message" role="status">
          {state.warning ?? "Saved."}
        </p>
      ) : null}

      <button type="submit" className="btn-solid" disabled={pending}>
        {pending
          ? "Saving…"
          : mode === "create"
            ? "Create post"
            : "Save changes"}
      </button>
    </form>
  );
}
