import { ITask } from "@rodez97/types-helpers";
import React from "react";

export const GeneratePDF = React.forwardRef<
  HTMLDivElement,
  {
    sectionName: string;
    tasksArray: ITask[];
    sectionId: string;
  }
>(({ sectionName, tasksArray, sectionId }, ref) => {
  return (
    <div
      style={{
        display: "none",
      }}
    >
      <div style={{ padding: "10px" }} id={sectionId} ref={ref}>
        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            fontWeight: "bold",
            marginBottom: "10px",
            color: "#333",
          }}
        >
          cuttinboard.com
        </p>
        <h4
          style={{
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "10px",
            color: "#333",
          }}
        >
          {sectionName}
        </h4>
        <ul style={{ listStyle: "none", padding: "0" }}>
          {tasksArray.map((task) => (
            <li style={{ marginBottom: "10px" }} key={task.id}>
              <input type="checkbox" style={{ marginRight: "10px" }} />
              {task.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});
