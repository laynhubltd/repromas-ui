import type { TemplateSegment, TemplateEditorMode } from "../types/matric-number-format";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { CloseOutlined, HolderOutlined } from "@ant-design/icons";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Flex, Input, Segmented, Typography } from "antd";

type TemplateSegmentEditorProps = {
  segments: TemplateSegment[];
  editorMode: TemplateEditorMode;
  template: string;
  readOnly?: boolean;
  onEditorModeChange: (mode: TemplateEditorMode) => void;
  onSegmentsChange: (segments: TemplateSegment[]) => void;
  onAdvancedTemplateChange: (value: string) => void;
};

function SortableSegment({
  segment,
  readOnly,
  onRemove,
  onLiteralChange,
}: {
  segment: TemplateSegment;
  readOnly: boolean;
  onRemove: () => void;
  onLiteralChange: (value: string) => void;
}) {
  const token = useToken();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: segment.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  if (segment.type === "token") {
    return (
      <div ref={setNodeRef} style={style}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgLayout,
            fontFamily: "monospace",
            fontSize: token.fontSizeSM,
            color: token.colorText,
          }}
        >
          {!readOnly && (
            <HolderOutlined
              {...attributes}
              {...listeners}
              style={{ cursor: "grab", fontSize: token.fontSizeSM, color: token.colorTextSecondary }}
            />
          )}
          {segment.value}
          {!readOnly && (
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined style={{ fontSize: 10 }} />}
              onClick={onRemove}
              aria-label="Remove token"
              style={{
                width: 18,
                height: 18,
                minWidth: 18,
                padding: 0,
                color: token.colorTextSecondary,
              }}
            />
          )}
        </span>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Flex align="center" gap={4}>
        {!readOnly && (
          <HolderOutlined
            {...attributes}
            {...listeners}
            style={{ cursor: "grab", fontSize: token.fontSizeSM, color: token.colorTextSecondary }}
          />
        )}
        <Input
          value={segment.value}
          disabled={readOnly}
          onChange={(e) => onLiteralChange(e.target.value)}
          style={{
            width: Math.max(48, segment.value.length * 10 + 24),
            fontFamily: "monospace",
            height: 32,
          }}
        />
        {!readOnly && (
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onRemove}
            aria-label="Remove segment"
          />
        )}
      </Flex>
    </div>
  );
}

export function TemplateSegmentEditor({
  segments,
  editorMode,
  template,
  readOnly = false,
  onEditorModeChange,
  onSegmentsChange,
  onAdvancedTemplateChange,
}: TemplateSegmentEditorProps) {
  const token = useToken();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = segments.findIndex((s) => s.id === active.id);
    const newIndex = segments.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onSegmentsChange(arrayMove(segments, oldIndex, newIndex));
  };

  const handleRemove = (id: string) => {
    onSegmentsChange(segments.filter((s) => s.id !== id));
  };

  const handleLiteralChange = (id: string, value: string) => {
    onSegmentsChange(
      segments.map((s) => (s.id === id ? { ...s, value } : s)),
    );
  };

  return (
    <Flex vertical gap={12}>
      <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
        <Typography.Text strong>Template builder</Typography.Text>
        <Segmented
          value={editorMode}
          disabled={readOnly}
          onChange={(val) => onEditorModeChange(val as TemplateEditorMode)}
          options={[
            { label: "Visual", value: "visual" },
            { label: "Advanced", value: "advanced" },
          ]}
        />
      </Flex>

      <ConditionalRenderer when={editorMode === "visual"}>
        <ConditionalRenderer when={segments.length === 0}>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Add tokens from the palette to build your matric number format.
          </Typography.Text>
        </ConditionalRenderer>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={segments.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
            <Flex
              wrap="wrap"
              gap={8}
              align="center"
              style={{
                minHeight: 48,
                padding: token.paddingSM,
                border: `1px dashed ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                background: token.colorBgContainer,
              }}
            >
              {segments.map((segment) => (
                <SortableSegment
                  key={segment.id}
                  segment={segment}
                  readOnly={readOnly}
                  onRemove={() => handleRemove(segment.id)}
                  onLiteralChange={(value) => handleLiteralChange(segment.id, value)}
                />
              ))}
            </Flex>
          </SortableContext>
        </DndContext>
      </ConditionalRenderer>

      <ConditionalRenderer when={editorMode === "advanced"}>
        <Input.TextArea
          value={template}
          disabled={readOnly}
          onChange={(e) => onAdvancedTemplateChange(e.target.value)}
          rows={4}
          maxLength={255}
          showCount
          style={{ fontFamily: "monospace" }}
          placeholder="{sessionUpperYYYY}/REG/{seq:6}"
        />
      </ConditionalRenderer>

      <div
        style={{
          padding: token.paddingSM,
          background: token.colorBgLayout,
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, display: "block" }}>
          Raw template
        </Typography.Text>
        <Typography.Text
          code
          style={{ fontSize: token.fontSizeSM, wordBreak: "break-all" }}
        >
          {template || "—"}
        </Typography.Text>
      </div>
    </Flex>
  );
}
