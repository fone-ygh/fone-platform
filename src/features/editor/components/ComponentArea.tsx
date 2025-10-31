import styled from "@emotion/styled";
import { Button, Checkbox, Flex } from "fone-design-system_v1";

import { AccordionCard } from "@/shared/ui/cardAccordion/CardAccordion";

import { AsideStyle } from "./AsideStyle";

function ComponentArea() {
  return (
    <AsideStyle>
      <AccordionCard
        title="컴포넌트"
        defaultOpenAll
        cssVars={{}}
        items={[
          {
            id: "btn",
            title: "버튼",
            content: (
              <Flex
                spacing="2rem"
                flexWrap="wrap"
                // maxHeight="20rem"
                sx={{ overflowY: "auto" }}
              >
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
                <Button color="#444">Button</Button>
              </Flex>
            ),
          },
          {
            id: "checkbox",
            title: "체크박스",
            content: (
              <Flex spacing="2rem">
                <Button color="#444">Button</Button>
                <Checkbox />
              </Flex>
            ),
          },
          {
            id: "accordion",
            title: "아코디언",
            content: (
              <Flex spacing="2rem">
                <Button color="#444">Button</Button>
                <Checkbox />
              </Flex>
            ),
          },
          {
            id: "tabs",
            title: "탭",
            content: (
              <Flex spacing="2rem">
                <Button color="#444">Button</Button>
                <Checkbox />
              </Flex>
            ),
          },
        ]}
      />
    </AsideStyle>
  );
}
export default ComponentArea;
