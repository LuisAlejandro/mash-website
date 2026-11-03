"use client";

import { useCallback, useState } from "react";

import BlogPostList from "./blog-post-list";
import type { PublicPostSummary } from "@/lib/blog/types";
import { MAX_SEARCH_QUERY_LENGTH } from "@/lib/search-query";

/**
 * The blog index with a search box over it.
 *
 * Searching is a submit rather than a keystroke, so a reader scrolling the
 * index never pays for a query they did not ask for. Clearing the field
 * restores the full list without a round trip.
 */
export default function BlogSearch({ posts }: { posts: PublicPostSummary[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicPostSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setResults(null);
      setError(null);
      return;
    }

    if (trimmed.length > MAX_SEARCH_QUERY_LENGTH) {
      setError("That search is too long.");
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/search-posts?q=${encodeURIComponent(trimmed)}`
      );
      const data = await response.json();
      if (!response.ok) {
        setError(
          typeof data.error === "string" ? data.error : "Search failed."
        );
        setResults([]);
        return;
      }
      setResults((data.response as PublicPostSummary[]) ?? []);
    } catch {
      setError("Search failed.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searching = results !== null;
  const list = searching ? results : posts;

  return (
    <div>
      <form
        className="blog-search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          void runSearch(query);
        }}
      >
        <label htmlFor="blog-search" className="sr-only">
          Search posts
        </label>
        <input
          id="blog-search"
          type="search"
          className="blog-search-input"
          value={query}
          maxLength={MAX_SEARCH_QUERY_LENGTH}
          placeholder="Search posts"
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            if (!next.trim()) {
              setResults(null);
              setError(null);
            }
          }}
        />
        <button type="submit" className="btn-solid" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error ? (
        <p className="blog-search-error" role="alert">
          {error}
        </p>
      ) : null}

      {searching && !error ? (
        <p className="blog-search-status" role="status">
          {list.length === 0
            ? `No results for “${query.trim()}”.`
            : `${list.length} result${list.length === 1 ? "" : "s"} for “${query.trim()}”.`}
        </p>
      ) : null}

      <BlogPostList
        posts={list}
        emptyMessage={
          searching ? "Nothing matched that search." : "No published posts yet."
        }
      />
    </div>
  );
}
