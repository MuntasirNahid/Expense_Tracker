import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ModalView } from "@/components/ModalView";

describe("ModalView Component", () => {
  it("renders correctly with text input", () => {
    const onCancel = jest.fn();
    const onSave = jest.fn();
    const onChangeText = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <ModalView
        visible={true}
        modalHeader="Create new Cashbook"
        isTextInputAvailable={true}
        placeHolderText="Enter Cashbook Name"
        textInputValue="Test Book"
        textInputOnChangeText={onChangeText}
        onPressCancel={onCancel}
        onPressSave={onSave}
        onRequestClose={() => {}}
      />
    );

    //Text input should be visible
    expect(getByPlaceholderText("Enter Cashbook Name")).toBeTruthy();

    //modal header should be visible
    expect(getByText("Create new Cashbook")).toBeTruthy();

    //Trigger input change
    fireEvent.changeText(
      getByPlaceholderText("Enter Cashbook Name"),
      "Updated Book"
    );
    expect(onChangeText).toHaveBeenCalledWith("Updated Book");

    //Press save
    fireEvent.press(getByText("Save"));
    expect(onSave).toHaveBeenCalled();

    //Press cancel
    fireEvent.press(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});
