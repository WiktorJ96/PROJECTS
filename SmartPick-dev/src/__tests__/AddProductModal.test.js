import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddProductModal from "../components/AddProductModal/AddProductModal";

describe("AddProductModal component", () => {
  const onAddProduct = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("does not render when `isOpen` is false", () => {
    render(
      <AddProductModal
        isOpen={false}
        onClose={onClose}
        onAddProduct={onAddProduct}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("renders modal when `isOpen` is true", () => {
    render(
      <AddProductModal
        isOpen={true}
        onClose={onClose}
        onAddProduct={onAddProduct}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("clears input fields when modal is closed and re-opened", () => {
    const { rerender } = render(
      <AddProductModal
        isOpen={true}
        onClose={onClose}
        onAddProduct={onAddProduct}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/nazwa produktu/i), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByPlaceholderText(/cena produktu/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByPlaceholderText(/link do produktu/i), {
      target: { value: "http://example.com" },
    });

    // Zamknij modal
    rerender(
      <AddProductModal
        isOpen={false}
        onClose={onClose}
        onAddProduct={onAddProduct}
      />
    );
    // Otwórz ponownie
    rerender(
      <AddProductModal
        isOpen={true}
        onClose={onClose}
        onAddProduct={onAddProduct}
      />
    );

    expect(screen.getByPlaceholderText(/nazwa produktu/i).value).toBe("");
    expect(screen.getByPlaceholderText(/cena produktu/i).value).toBe("");
    expect(screen.getByPlaceholderText(/link do produktu/i).value).toBe("");
  });

  test("validates empty inputs and shows alert when fields are missing", () => {
    window.alert = jest.fn();
    render(
      <AddProductModal
        isOpen={true}
        onClose={onClose}
        onAddProduct={onAddProduct}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /dodaj produkt/i }));

    expect(window.alert).toHaveBeenCalledWith("Wszystkie pola są wymagane.");
    expect(onAddProduct).not.toHaveBeenCalled();
  });

  test("validates that product price is a number", () => {
    window.alert = jest.fn();
    render(
      <AddProductModal
        isOpen={true}
        onClose={onClose}
        onAddProduct={onAddProduct}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/nazwa produktu/i), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByPlaceholderText(/cena produktu/i), {
      target: { value: "not a number" },
    });
    fireEvent.change(screen.getByPlaceholderText(/link do produktu/i), {
      target: { value: "http://example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /dodaj produkt/i }));

    expect(window.alert).toHaveBeenCalledWith("Cena powinna być liczbą.");
    expect(onAddProduct).not.toHaveBeenCalled();
  });

  test("calls `onAddProduct` and `onClose` with valid inputs", () => {
    render(
      <AddProductModal
        isOpen={true}
        onClose={onClose}
        onAddProduct={onAddProduct}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/nazwa produktu/i), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByPlaceholderText(/cena produktu/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByPlaceholderText(/link do produktu/i), {
      target: { value: "http://example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /dodaj produkt/i }));

    expect(onAddProduct).toHaveBeenCalledWith({
      name: "Test Product",
      price: "100",
      link: "http://example.com",
    });
    expect(onClose).toHaveBeenCalled();
  });

  test("closes modal on 'Escape' key press", () => {
    render(
      <AddProductModal
        isOpen={true}
        onClose={onClose}
        onAddProduct={onAddProduct}
      />
    );

    // Symuluje naciśnięcie klawisza Escape na `document`
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });


  test("adds product on 'Enter' key press when inputs are valid", () => {
    render(
      <AddProductModal
        isOpen={true}
        onClose={onClose}
        onAddProduct={onAddProduct}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/nazwa produktu/i), {
      target: { value: "Test Product" },
    });
    fireEvent.change(screen.getByPlaceholderText(/cena produktu/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByPlaceholderText(/link do produktu/i), {
      target: { value: "http://example.com" },
    });

    fireEvent.keyDown(screen.getByPlaceholderText(/link do produktu/i), {
      key: "Enter",
      code: "Enter",
    });

    expect(onAddProduct).toHaveBeenCalledWith({
      name: "Test Product",
      price: "100",
      link: "http://example.com",
    });
    expect(onClose).toHaveBeenCalled();
  });
});
