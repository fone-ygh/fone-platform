import React from "react";
import { Button } from "fone-design-system_v1";
import type { ColumnNode } from "../interface/type";

function attachForNode(node: ColumnNode, onButtonClick?: (col: ColumnNode) => void): ColumnNode {
	if (node.columns && Array.isArray(node.columns) && node.columns.length > 0) {
		return {
			...node,
			columns: node.columns.map((child) => attachForNode(child, onButtonClick)),
		};
	}
	if (node.type === "custom" && !node.component) {
        console.log("node : ", node)
		return {
			...node,
			component: (
				<Button
					variant="contained"
					size="small"
					sx={{ width: "200px" }}
					onClick={() => onButtonClick?.(node)}
				>
					{/* 현재 이 위치에서는 row(데이터) 값을 직접 접근할 수 없습니다.
					    여기서는 컬럼의 key(header 등) 값만 사용할 수 있어, 
					    각 행의 데이터 값을 버튼 내용으로 넣으려면 실제 셀 렌더링 시점에 구현해야 합니다.
					    즉, 이 영역에서는 데이터 접근이 불가하므로 node.key만 표시됩니다. */}
					{node.key}
				</Button>
			),
		};
	}
	return node;
}

export function attachDefaultComponents(columns: ColumnNode[], onButtonClick?: (col: ColumnNode) => void): ColumnNode[] {
	return columns.map((col) => attachForNode(col, onButtonClick));
}


