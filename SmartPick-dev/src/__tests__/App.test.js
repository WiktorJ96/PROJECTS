import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

test("renders App component", () => {
  render(<App />);
  // Minimalna asercja, aby upewnić się, że komponent się renderuje
  expect(
    screen.getByText(/some text in your App component/i)
  ).toBeInTheDocument();
});
