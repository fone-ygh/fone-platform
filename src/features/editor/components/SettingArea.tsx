import Aside from "@/shared/components/layout/aside/Aside";
import { AccordionCard } from "@/shared/components/ui/cardAccordion/CardAccordion";
import CanvasSizeControl from "@/shared/components/ui/controls/canvasSizeControl/CanvasSizeControl";
import GridControl from "@/shared/components/ui/controls/gridControl/GridControl";
import GuideControl from "@/shared/components/ui/controls/guideControl/GuideControl";
import JsonIOControl from "@/shared/components/ui/controls/jsonIOControl/JsonIOControl";
import ServerIOControl from "@/shared/components/ui/controls/serverIOControl/ServerIOControl";
import SnapControl from "@/shared/components/ui/controls/snapControl/SnapControl";
import ZoomControl from "@/shared/components/ui/controls/zoomControl/ZoomControl";

function SettingArea() {
  const items = [
    {
      id: "canvas-size",
      title: "캔버스크기",
      content: <CanvasSizeControl />,
    },
    {
      id: "json-io",
      title: "JSON 내보내기/불러오기",
      content: <JsonIOControl />,
    },
    {
      id: "server",
      title: "서버저장",
      content: <ServerIOControl />,
    },
    {
      id: "zoom",
      title: "확대/축소",
      content: <ZoomControl />,
    },
    {
      id: "grid",
      title: "그리드",
      content: <GridControl />,
    },
    {
      id: "snap",
      title: "스냅",
      content: <SnapControl />,
    },
    {
      id: "guide",
      title: "가이드/룰러",
      content: <GuideControl />,
    },
  ];

  return (
    <Aside position="right">
      <AccordionCard
        title="Setting"
        defaultOpenAll
        hideControls
        items={items}
      />
    </Aside>
  );
}

export default SettingArea;
