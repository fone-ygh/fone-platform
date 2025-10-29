"use client";

import Image from "next/image";
import { Button } from "fone-design-system_v2";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: 800,
          background: "#fff",
          padding: 48,
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Image
            src="/next.svg"
            alt="Next.js"
            width={100}
            height={20}
            priority
          />
          <Image src="/vercel.svg" alt="Vercel" width={16} height={16} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            Hybrid (Layered + Feature) 구조 시작
          </h1>
          <p style={{ color: "#666", margin: 0 }}>
            이 페이지는 feature 모듈에서 렌더링됩니다.
          </p>
          <div>
            <Button>Click me</Button>
            <Button variant="outlined">Click me</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
