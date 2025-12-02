import styled from "@emotion/styled";
import { Container } from "@mui/material";
import { Button } from "fone-design-system_v1";

export default function Header() {
  return (
    <HeaderBar>
      <Container>
        <Toolbar>
          <Brand href="/" aria-label="UI Platform 홈">
            <BrandBadge>UI</BrandBadge>
            <BrandName>UI Platform</BrandName>
          </Brand>

          <Nav aria-label="주요">
            {[
              { label: "화면패턴", href: "/pattern" },
              { label: "그리드", href: "/table" },
              { label: "리사이즈", href: "/resize" },
            ].map(item => (
              <Button key={item.href} variant="text" href={item.href}>
                {item.label}
              </Button>
            ))}
          </Nav>
        </Toolbar>
      </Container>
    </HeaderBar>
  );
}

const HeaderBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(18, 24, 40, 0.1);
`;

const Toolbar = styled.div`
  min-height: 6.4rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const Brand = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  color: inherit;
  text-decoration: none;
  &:focus-visible {
    outline: 2px solid var(--ds-color-primary, #1f6feb);
    outline-offset: 2px;
  }
`;

const BrandBadge = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 0.9rem;
  background: var(--ds-color-primary, #1f6feb);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 900;
`;

const BrandName = styled.span`
  font-weight: 800;
  font-size: var(--ds-font-size-base, 1.5rem);
  letter-spacing: 0.01rem;
  color: var(--ds-text-default, #2d2d2d);
`;

const Nav = styled.nav`
  margin-left: auto;
  display: flex;
  gap: 0.4rem;
  & a.btn {
    text-decoration: none;
  }
`;
