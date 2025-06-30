import { useEffect, useState } from "react";
import { blocksq } from "../../mocks/mocks";
import { usePDFStore } from "../../store/store";
import Block from "../Block/Block";

import style from "./RightPanel.module.css";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  pointerWithin,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function RightPanel() {
  const { selectedRegions, addRegion, setSelectedRegions } = usePDFStore();
  const [activeItem, setActiveItem] = useState();

  const sensors = useSensors(
    useSensor(TouchSensor),
    useSensor(MouseSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // useEffect(() => {
  //   setSelectedRegions(blocksq);
  // }, []);

  const handleDragStart = (event) => {
    const { active } = event;

    setActiveItem(selectedRegions.find((item) => item.id === active.id));
  };

  function handleDragEnd(event) {
    const { active, over } = event;

    const activeItem = selectedRegions.find((item) => item.id === active.id);
    const overItem = selectedRegions.find((item) => item.id === over.id);

    if (!activeItem || !overItem) {
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = selectedRegions.findIndex(
        (item) => item.id === active.id
      );
      const newIndex = selectedRegions.findIndex((item) => item.id === over.id);
      const newRegions = arrayMove(selectedRegions, oldIndex, newIndex);
      setSelectedRegions(newRegions);
    }
    setActiveItem(undefined);
  }

  return (
    <div className={style.rightPanel}>
      <h2>Выбранные области</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={Array.isArray(selectedRegions) ? selectedRegions : []}
          strategy={verticalListSortingStrategy}
        >
          <ul className={style.blocksList}>
            {selectedRegions.map((block) => (
              <Block key={block.ml_id} block={block} id={block.ml_id} />
            ))}
          </ul>
        </SortableContext>
        <DragOverlay
          style={{
            // transformOrigin: "0 0 ",
            // width: "fit-content",
            // height: "fit-content",

            width: "",
            height: "100px",
          }}
        >
          {activeItem ? <Block block={activeItem} id={activeItem.id} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
