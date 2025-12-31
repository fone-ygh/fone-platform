"use client";

import { useRouter } from "next/navigation";

import PatternList from "@/features/patterns/components/PatternList";

export default function PatternPage() {
  const router = useRouter();

  return (
    <PatternList
      title="패턴 갤러리"
      onCreateBlank={() =>
        router.push("/editor/pattern/new?originPatternId=null")
      }
      onSelectPattern={patternId =>
        router.push(
          `/editor/pattern/new?originPatternId=${encodeURIComponent(patternId)}`,
        )
      }
    />
  );
}
