// src/features/.../ComponentArea.tsx
import styled from "@emotion/styled";
import { Checkbox, Flex } from "fone-design-system_v1";

import { Button } from "@/shared/ui/button2/Button2";
import { AccordionCard } from "@/shared/ui/cardAccordion/CardAccordion";

import { AsideStyle } from "./AsideStyle";

function ComponentArea() {
  return (
    <AsideStyle>
      <AccordionCard
        title="레이아웃 영역별 컴포넌트"
        defaultOpenAll
        cssVars={{}}
        items={[
          /* ── HEADER ─────────────────────────────────────────────── */
          {
            id: "area-header",
            title: "Header",
            content: (
              <Flex
                spacing="1.2rem"
                flexWrap="wrap"
                sx={{ overflowY: "auto" }}
                aria-label="Header components"
              >
                <Button>Logo</Button>
                <Button>Topbar</Button>
                <Button>Search</Button>
                <Button>User Menu</Button>
                <Button>Actions</Button>
                <Button>Notice Bar</Button>
              </Flex>
            ),
          },

          /* ── NAV ────────────────────────────────────────────────── */
          {
            id: "area-nav",
            title: "Nav",
            content: (
              <Flex
                spacing="1.2rem"
                flexWrap="wrap"
                sx={{ overflowY: "auto" }}
                aria-label="Navigation components"
              >
                <Button>Global Nav</Button>
                <Button>Side Nav</Button>
                <Button>Tabs</Button>
                <Button>Breadcrumbs</Button>
                <Button>Quick Menu</Button>
              </Flex>
            ),
          },

          /* ── MAIN ───────────────────────────────────────────────── */
          {
            id: "area-main",
            title: "Main",
            content: (
              <Flex
                spacing="1.2rem"
                flexWrap="wrap"
                sx={{ overflowY: "auto" }}
                aria-label="Main area components"
              >
                <Button>Hero</Button>
                <Button>Card</Button>
                <Button>Table</Button>
                <Button>Form</Button>
                <Button>Chart</Button>
                <Button>Grid</Button>
              </Flex>
            ),
          },

          /* ── CONTENT (본문 위젯 모음) ───────────────────────────── */
          {
            id: "area-content",
            title: "Content",
            content: (
              <Flex
                spacing="1.2rem"
                flexWrap="wrap"
                sx={{ overflowY: "auto" }}
                aria-label="Content widgets"
              >
                <Button>Section</Button>
                <Button>List</Button>
                <Button>Accordion</Button>
                <Button>Tabs</Button>
                <Button>Pagination</Button>
                <Button>Empty State</Button>
                <Checkbox />
              </Flex>
            ),
          },

          /* ── FOOTER ─────────────────────────────────────────────── */
          {
            id: "area-footer",
            title: "Footer",
            content: (
              <Flex
                spacing="1.2rem"
                flexWrap="wrap"
                sx={{ overflowY: "auto" }}
                aria-label="Footer components"
              >
                <Button>Footer Links</Button>
                <Button>Language</Button>
                <Button>Legal</Button>
                <Button>Status</Button>
              </Flex>
            ),
          },
        ]}
      />
    </AsideStyle>
  );
}

export default ComponentArea;
