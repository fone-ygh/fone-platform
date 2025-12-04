// app/editor/[id]/page.tsx
import Page from "@/features/editor/page";

type EditorPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Editor({
  params,
  searchParams,
}: EditorPageProps) {
  const { id } = await params;
  const search = await searchParams;

  console.log("id : ", id);

  const rawPattern = search.patternId;
  const patternId =
    typeof rawPattern === "string" && rawPattern.length > 0
      ? rawPattern
      : undefined;

  return <Page id={id} patternId={patternId} />;
}
