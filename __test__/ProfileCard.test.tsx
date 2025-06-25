import React from "react";
import { render } from "@testing-library/react-native";
import { ProfileCard } from "@/components/ProfileCard";

describe("ProfileCard", () => {
  it("renders welcome message and user name", () => {
    const { getByText } = render(<ProfileCard />);

    expect(getByText("Welcome")).toBeTruthy();
    expect(getByText("Muntasir")).toBeTruthy();
  });

  it("renders the avatar image", () => {
    const { getByTestId } = render(<ProfileCard />);
    expect(getByTestId("profile-avatar")).toBeTruthy();
  });
});
