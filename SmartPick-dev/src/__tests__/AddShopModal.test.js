import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddShopModal from "../components/AddShopModal/AddShopModal";

describe("AddShopModal", () => {
  const mockOnClose = jest.fn(); // Mock funkcji onClose
  const mockOnAddShop = jest.fn(); // Mock funkcji onAddShop

  beforeEach(() => {
    jest.clearAllMocks(); // Czyszczenie mocków przed każdym testem
  });

  test("renders modal when isOpen is true", () => {
    render(
      <AddShopModal
        isOpen={true}
        onClose={mockOnClose}
        onAddShop={mockOnAddShop}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nazwa sklepu")).toBeInTheDocument();
  });

  test("does not render modal when isOpen is false", () => {
    render(
      <AddShopModal
        isOpen={false}
        onClose={mockOnClose}
        onAddShop={mockOnAddShop}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("shows an error message when saving with empty input", () => {
    render(
      <AddShopModal
        isOpen={true}
        onClose={mockOnClose}
        onAddShop={mockOnAddShop}
      />
    );

    const saveButton = screen.getByText("Zapisz");
    fireEvent.click(saveButton);

    expect(screen.getByText("Nazwa sklepu jest wymagana.")).toBeInTheDocument();
    expect(mockOnAddShop).not.toHaveBeenCalled();
  });

  test("calls onAddShop with the shop name and clears the input on save", () => {
    render(
      <AddShopModal
        isOpen={true}
        onClose={mockOnClose}
        onAddShop={mockOnAddShop}
      />
    );

    const input = screen.getByPlaceholderText("Nazwa sklepu");
    const saveButton = screen.getByText("Zapisz");

    fireEvent.change(input, { target: { value: "Test Shop" } });
    fireEvent.click(saveButton);

    expect(mockOnAddShop).toHaveBeenCalledWith("Test Shop");
    expect(mockOnAddShop).toHaveBeenCalledTimes(1);
    expect(input.value).toBe(""); // Pole powinno być wyczyszczone
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("removes error message when input is changed after validation error", () => {
    render(
      <AddShopModal
        isOpen={true}
        onClose={mockOnClose}
        onAddShop={mockOnAddShop}
      />
    );

    const saveButton = screen.getByText("Zapisz");
    fireEvent.click(saveButton);

    expect(screen.getByText("Nazwa sklepu jest wymagana.")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Nazwa sklepu");
    fireEvent.change(input, { target: { value: "Test Shop" } });

    expect(
      screen.queryByText("Nazwa sklepu jest wymagana.")
    ).not.toBeInTheDocument();
  });

  test("calls onClose when the cancel button is clicked", () => {
    render(
      <AddShopModal
        isOpen={true}
        onClose={mockOnClose}
        onAddShop={mockOnAddShop}
      />
    );

    const cancelButton = screen.getByText("Anuluj");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
