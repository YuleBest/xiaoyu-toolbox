import request from "./request";

export interface GuessResult {
  name: string;
  trans: string[] | null;
  inputting: string[];
}

export const guessHhsh = async (text: string) => {
  const { data } = await request.post<GuessResult[]>("/api/hhsh/guess", {
    text,
  });
  return data;
};

export const submitTranslation = async (name: string, text: string) => {
  const { data } = await request.post<unknown>(
    `/api/hhsh/translation/${encodeURIComponent(name)}`,
    { text },
  );
  return data;
};
