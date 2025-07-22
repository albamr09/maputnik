import InputButton from "./InputButton";

type FloorSelectorProps = {
  floorIds?: number[];
  selectedFloorId?: number;
  onFloorSelected: (floorId: number) => void;
};

const FloorSelector = ({
  floorIds,
  selectedFloorId,
  onFloorSelected,
}: FloorSelectorProps) => {
  return (
    <div
      className="maputnik-modal"
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        right: "10px",
        padding: 5,
        minWidth: "unset",
        display: "flex",
        gap: 5,
      }}
    >
      {floorIds?.map((floorId) => (
        <InputButton
          style={{
            background: floorId == selectedFloorId ? "white" : "unset",
            color: floorId == selectedFloorId ? "black" : "unset",
          }}
          onClick={() => {
            onFloorSelected(floorId);
          }}
        >
          {floorId}
        </InputButton>
      ))}
    </div>
  );
};

export default FloorSelector;
