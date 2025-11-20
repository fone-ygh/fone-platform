import React, { useRef } from "react";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";


export default function JspreadSheet() {
    // Spreadsheet array of worksheets
    const spreadsheet = useRef<Spreadsheet>(null);
    
    // Render component
    return (
        <>
            <div>
                <button><span className="material-icons" onClick={() => {
                    spreadsheet!.current![0]?.insertRow();
                }}>add</span></button>
                <button><span className="material-icons" onClick={() => {
                    spreadsheet!.current![0]?.deleteRow();
                }}>remove</span></button>
                <button><span className="material-icons" onClick={() => {
                    spreadsheet!.current![0]?.insertColumn();
                }}>add</span></button>
                <button><span className="material-icons" onClick={() => {
                    spreadsheet!.current![0]?.deleteColumn();
                }}>remove</span></button>
            </div>

            <Spreadsheet ref={spreadsheet} toolbar={true}>
                <Worksheet minDimensions={[6,6]} />
            </Spreadsheet>

            <button onClick={() => {
                console.log("spreadsheet : ", spreadsheet!.current![0]);
                console.log("spreadsheet : ", spreadsheet!.current![0].getData());
                console.log("spreadsheet : ", spreadsheet!.current![0].getHeaders());
                console.log("spreadsheet : ", spreadsheet!.current![0].getHeader(1));
                console.log("spreadsheet : ", spreadsheet!.current![0].getMerge());
                const rawData = spreadsheet!.current![0].getData();
                // 0번째 배열은 header, 1부터는 children들을 의미
                const rowDatas = rawData;
                const headers = spreadsheet!.current![0].getHeaders().split(",");
                const mergeData = spreadsheet!.current![0].getMerge();
                console.log("headers : ", headers);
                console.log("rowDatas : ", rowDatas);
                console.log("mergeData : ", mergeData);

                const resultHeaders = [];


                rowDatas.forEach((row: any[], rowIdx: number) => {
                    let currentHeaderMergeValue: any[] = [];
                    let currentHeaderMergeValueString = "";
                    row.forEach((cell: any, colIdx: number) => {
                        if(mergeData[headers[colIdx]+(rowIdx+1)]){
                            currentHeaderMergeValue.push(mergeData[headers[colIdx]+(rowIdx+1)]);
                            currentHeaderMergeValueString = headers[colIdx]+(rowIdx+1);
                            console.log(`mergeData  ${headers[colIdx]+(rowIdx+1)}: `, mergeData[headers[colIdx]+(rowIdx+1)]);
                        }
                    });
                    console.log("currentHeaderMergeValue : ", currentHeaderMergeValue);
                    console.log("currentHeaderMergeValueString : ", currentHeaderMergeValueString);

                });



            }}>
                헤더 데이터 확인
            </button>
                
            

            <div>
                선택 셀 설정 값
                <div>
                    <div>
                        <p>Selected Cell : </p>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>key</div> : <input  />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>title</div> : <input />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>type</div> : <input />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>width</div> : <input />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>height</div> : <input />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>resizable</div> : <input />
                        </div>
                        <div style={{display:"flex", justifyContent:"space-between", width: "300px"}}>
                            <div style={{width:"100px"}}>draggable</div> : <input />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}