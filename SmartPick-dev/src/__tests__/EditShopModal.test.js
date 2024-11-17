import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditShopModal from "../components/EditShopModal/EditShopModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal/DeleteConfirmationModal";

jest.mock(
  "../components/DeleteConfirmationModal/DeleteConfirmationModal",
  () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="delete-confirmation-modal"></div>),
  })
);

describe("EditShopModal", () => {
  const mockOnClose = jest.fn();
  const mockOnUpdateShopName = jest.fn();
  const mockOnDeleteShop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal when isOpen is true", () => {
    render(
      <EditShopModal
        isOpen={true}
        onClose={mockOnClose}
        shop="Test Shop"
        onUpdateShopName={mockOnUpdateShopName}
        onDeleteShop={mockOnDeleteShop}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/edytuj sklep/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Shop")).toBeInTheDocument();
  });

  test("does not render modal when isOpen is false", () => {
    render(
      <EditShopModal
        isOpen={false}
        onClose={mockOnClose}
        shop="Test Shop"
        onUpdateShopName={mockOnUpdateShopName}
        onDeleteShop={mockOnDeleteShop}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("calls onUpdateShopName and onClose when saving valid shop name", () => {
    render(
      <EditShopModal
        isOpen={true}
        onClose={mockOnClose}
        shop="Test Shop"
        onUpdateShopName={mockOnUpdateShopName}
        onDeleteShop={mockOnDeleteShop}
      />
    );

    const input = screen.getByDisplayValue("Test Shop");
    fireEvent.change(input, { target: { value: "Updated Shop" } });

    fireEvent.click(screen.getByText(/zapisz/i));

    expect(mockOnUpdateShopName).toHaveBeenCalledWith("Updated Shop");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("shows an error message when trying to save an empty shop name", () => {
    render(
      <EditShopModal
        isOpen={true}
        onClose={mockOnClose}
        shop="Test Shop"
        onUpdateShopName={mockOnUpdateShopName}
        onDeleteShop={mockOnDeleteShop}
      />
    );

    const input = screen.getByDisplayValue("Test Shop");
    fireEvent.change(input, { target: { value: "" } });

    fireEvent.click(screen.getByText(/zapisz/i));

    expect(
      screen.getByText(/nazwa sklepu nie może być pusta/i)
    ).toBeInTheDocument();
    expect(mockOnUpdateShopName).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("calls onClose when 'Anuluj' button is clicked", () => {
    render(
      <EditShopModal
        isOpen={true}
        onClose={mockOnClose}
        shop="Test Shop"
        onUpdateShopName={mockOnUpdateShopName}
        onDeleteShop={mockOnDeleteShop}
      />
    );

    fireEvent.click(screen.getByText(/anuluj/i));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test("opens delete confirmation modal when 'Usuń' button is clicked", () => {
    render(
      <EditShopModal
        isOpen={true}
        onClose={mockOnClose}
        shop="Test Shop"
        onUpdateShopName={mockOnUpdateShopName}
        onDeleteShop={mockOnDeleteShop}
      />
    );

    fireEvent.click(screen.getByText(/usuń/i));

    expect(screen.getByTestId("delete-confirmation-modal")).toBeInTheDocument();
  });

  test("calls onDeleteShop and onClose when confirming deletion", () => {
    DeleteConfirmationModal.mockImplementation(({ onConfirm }) => (
      <div>
        <button onClick={onConfirm} data-testid="confirm-delete">
          Confirm Delete
        </button>
      </div>
    ));

    render(
      <EditShopModal
        isOpen={true}
        onClose={mockOnClose}
        shop="Test Shop"
        onUpdateShopName={mockOnUpdateShopName}
        onDeleteShop={mockOnDeleteShop}
      />
    );

    fireEvent.click(screen.getByText(/usuń/i));
    fireEvent.click(screen.getByTestId("confirm-delete"));

    expect(mockOnDeleteShop).toHaveBeenCalledWith("Test Shop");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
