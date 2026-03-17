export const DEFAULT_QUICK_PROMPTS = [
  "Goi y phong tro duoi 5 trieu o Quan 1",
  "Checklist khi ky hop dong thue nha",
  "Cach kiem tra phong truoc khi dat coc",
];

export const SEARCH_CONTEXT_PROMPTS = [
  "Tim phong theo khu vuc va ngan sach hop ly",
  "Nen uu tien tieu chi nao khi loc phong",
];

export const getPromptsByPath = (pathname) => {
  if (pathname.startsWith("/search")) {
    return [...DEFAULT_QUICK_PROMPTS, ...SEARCH_CONTEXT_PROMPTS];
  }

  return DEFAULT_QUICK_PROMPTS;
};
