// src/features/.../ComponentArea.tsx
import styled from "@emotion/styled";
import { Button, Checkbox, Flex } from "fone-design-system_v1";

import Aside from "@/shared/components/layout/aside/Aside";
import { AccordionCard } from "@/shared/components/ui/cardAccordion/CardAccordion";

function ComponentArea() {
  return (
    <Aside position="left">
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
                <Button variant="outlined" size="xsmall">
                  Logo
                </Button>
                <Button variant="outlined" size="xsmall">
                  Topbar
                </Button>
                <Button variant="outlined" size="xsmall">
                  Search
                </Button>
                <Button variant="outlined" size="xsmall">
                  User Menu
                </Button>
                <Button variant="outlined" size="xsmall">
                  Actions
                </Button>
                <Button variant="outlined" size="xsmall">
                  Notice Bar
                </Button>
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
                <Button variant="outlined" size="xsmall">
                  Global Nav
                </Button>
                <Button variant="outlined" size="xsmall">
                  Side Nav
                </Button>
                <Button variant="outlined" size="xsmall">
                  Tabs
                </Button>
                <Button variant="outlined" size="xsmall">
                  Breadcrumbs
                </Button>
                <Button variant="outlined" size="xsmall">
                  Quick Menu
                </Button>
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
                <Button variant="outlined" size="xsmall">
                  Hero
                </Button>
                <Button variant="outlined" size="xsmall">
                  Card
                </Button>
                <Button variant="outlined" size="xsmall">
                  Table
                </Button>
                <Button variant="outlined" size="xsmall">
                  Form
                </Button>
                <Button variant="outlined" size="xsmall">
                  Chart
                </Button>
                <Button variant="outlined" size="xsmall">
                  Grid
                </Button>
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
                <Button variant="outlined" size="xsmall">
                  Section
                </Button>
                <Button variant="outlined" size="xsmall">
                  List
                </Button>
                <Button variant="outlined" size="xsmall">
                  Accordion
                </Button>
                <Button variant="outlined" size="xsmall">
                  Tabs
                </Button>
                <Button variant="outlined" size="xsmall">
                  Pagination
                </Button>
                <Button variant="outlined" size="xsmall">
                  Empty State
                </Button>
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
                <Button variant="outlined" size="xsmall">
                  Footer Links
                </Button>
                <Button variant="outlined" size="xsmall">
                  Language
                </Button>
                <Button variant="outlined" size="xsmall">
                  Legal
                </Button>
                <Button variant="outlined" size="xsmall">
                  Status
                </Button>
              </Flex>
            ),
          },
        ]}
      />
    </Aside>
  );
}

export default ComponentArea;
