import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal/DeleteConfirmationModal";

describe("DeleteConfirmationModal", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Czyścimy mocki przed każdym testem
  });

  test("renders modal when isOpen is true", () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        item="Test Item"
        itemType="produkt"
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/potwierdź usunięcie/i)).toBeInTheDocument();
    expect(
      screen.getByText(/czy na pewno chcesz usunąć produkt "Test Item"\?/i)
    ).toBeInTheDocument();
  });

  test("does not render modal when isOpen is false", () => {
    render(
      <DeleteConfirmationModal
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        item="Test Item"
        itemType="produkt"
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("calls onClose when 'Anuluj' button is clicked", () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        item="Test Item"
        itemType="produkt"
      />
    );

    fireEvent.click(screen.getByText(/anuluj/i));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("calls onConfirm when 'Usuń' button is clicked", () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        item="Test Item"
        itemType="produkt"
      />
    );

    fireEvent.click(screen.getByText(/usuń/i));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test("calls onConfirm when Enter key is pressed", () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        item="Test Item"
        itemType="produkt"
      />
    );

    fireEvent.keyDown(document, { key: "Enter", code: "Enter" });
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when Escape key is pressed", () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        item="Test Item"
        itemType="produkt"
      />
    );

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("truncates item text if it exceeds 30 characters", () => {
    const longItemName = "Lorem ipsum dolor sit amet consectetur";
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        item={longItemName}
        itemType="produkt"
      />
    );

    expect(
      screen.getByText(/lorem ipsum dolor sit amet co.../i)
    ).toBeInTheDocument();
  });
});
