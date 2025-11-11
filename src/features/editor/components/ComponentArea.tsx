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
        hideControls
        cssVars={{}}
        items={[
          /* ── HEADER ─────────────────────────────────────────────── */
          {
            id: "area-header",
            // title: "Header",
            content: (
              <Flex
                spacing="1.2rem"
                flexWrap="wrap"
                sx={{ overflowY: "auto" }}
                aria-label="Header components"
              >
                <Button variant="outlined" size="xsmall">
                  Box
                </Button>
                <Button variant="outlined" size="xsmall">
                  text
                </Button>
                <Button variant="outlined" size="xsmall">
                  image
                </Button>
                <Button variant="outlined" size="xsmall">
                  Button
                </Button>
                <Button variant="outlined" size="xsmall">
                  List
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
