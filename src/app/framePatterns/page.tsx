"use client";

import { useRouter } from "next/navigation";

import PatternList from "@/features/framePatterns/components/PatternList";

export default function PatternPage() {
  const router = useRouter();

  return (
    <PatternList
      title="프레임 패턴 갤러리"
      onCreateBlank={() =>
        router.push("/frameEditor/pattern/new?originPatternId=null")
      }
      onSelectPattern={patternId =>
        router.push(
          `/frameEditor/pattern/new?originPatternId=${encodeURIComponent(patternId)}`,
        )
      }
    />
  );
}
