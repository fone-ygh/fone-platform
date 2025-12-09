// app/editor/[id]/page.tsx
import Page from "@/features/editor/page";

type EditorPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    id: string;
    originPatternId?: string;
  }>;
};

const pick = (v?: string | string[]) =>
  typeof v === "string" && v.trim().length ? v : undefined;

export default async function Editor({
  params,
  searchParams,
}: EditorPageProps) {
  const { id: routeId } = await params;
  const sp = await searchParams;

  const id = sp.id;
  const originPatternId = pick(sp.originPatternId); // 없으면 undefined

  console.log({ routeId, id, originPatternId });

  return <Page routeId={routeId} id={id} originPatternId={originPatternId} />;
}
