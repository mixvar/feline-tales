export const STORIES_QUERY_KEY = ["stories"];

export const STORY_BY_ID_QUERY_KEY = (
  storyId: string,
) => [...STORIES_QUERY_KEY, "id", storyId];
