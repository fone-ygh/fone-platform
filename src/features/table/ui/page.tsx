'use client';

import styled from "@emotion/styled";
import React, { useEffect } from "react";
import JspreadSheet from "./JspreadSheet";

const TablePage = () => {

	useEffect(() => {
		const blockKeys = (e: any) => {
		  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
			e.preventDefault();
			e.stopImmediatePropagation();
		  }
		};
	  
		window.addEventListener("keydown", blockKeys, { capture: true });
		return () => {
		  window.removeEventListener("keydown", blockKeys, { capture: true });
		};
	  }, []);

    return (
        <TableContainer>

			<div style={{ position: 'relative',  }}>
				<JspreadSheet />
				
			</div>
        </TableContainer>
    );
};

export default TablePage;   

const TableContainer = styled.div`
	width: 100%;
	height: 100%;
	.rdg-cell[aria-selected="true"] {
		background-color: transparent !important;
		outline: none;
	}

	.no-drag {
		user-select: none;          /* 표준 */
		-webkit-user-select: none;  /* Safari/Chrome */
		-moz-user-select: none;     /* Firefox (구형) */
		-ms-user-select: none;      /* IE/Edge (구형) */

		-webkit-user-drag: none;    /* 이미지 등 드래그 비허용 (WebKit) */}
`;