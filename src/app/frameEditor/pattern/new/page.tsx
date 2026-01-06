// src/app/editor/screen/new/page.tsx
import NewPatternClient from "@/features/frameEditor/pages/NewPatternClient";

type SearchParams = {
  originPatternId?: string;
};

type PageProps = {
  // Next 버전에 따라 Promise일 수도/아닐 수도 있어서 둘 다 허용
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};

  const raw = sp.originPatternId;
  const originPatternId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;

  return <NewPatternClient originPatternId={originPatternId} />;
}
