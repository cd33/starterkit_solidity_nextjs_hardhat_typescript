const Counter = (props: {
  counter: number;
  setCounter: Function;
  start: number;
  limit: number;
}) => {
  const increase = () => {
    if (props.counter < props.limit) {
      props.setCounter((count: number) => count + 1);
    }
  };
  const decrease = () => {
    if (props.counter > props.start) {
      props.setCounter((count: number) => count - 1);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "cetner",
        color: "white",
      }}
    >
      <button onClick={decrease}>-</button>
      <p style={{ margin: "0 15px" }}>{props.counter}</p>
      <button onClick={increase}>+</button>
    </div>
  );
};

export default Counter;
