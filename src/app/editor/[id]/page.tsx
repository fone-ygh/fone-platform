// app/editor/[id]/page.tsx
import Page from "@/features/editor/page";

type EditorPageProps = {
  // ⬅️ Next 15 기준: 둘 다 Promise
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Editor({
  params,
  searchParams,
}: EditorPageProps) {
  // Promise 해제
  const { id } = await params;
  const search = await searchParams;

  console.log("id : ", id);

  const rawPattern = search.patternId;
  const patternId =
    typeof rawPattern === "string" && rawPattern.length > 0
      ? rawPattern
      : undefined;

  // id = "new" 이면 새 화면 + 패턴 적용
  // id = "1234" 같은 값이면 기존 화면 편집용
  return <Page id={id} patternId={patternId} />;
}
