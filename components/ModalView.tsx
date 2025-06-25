import { StyleSheet, View, Text, Modal, TextInput } from "react-native";
import { Button } from "react-native-paper";

type Props = {
  visible: boolean;
  modalHeader: string;
  isTextInputAvailable: boolean;
  placeHolderText: string;
  textInputValue: string;
  textInputOnChangeText: (text: string) => void;
  onPressCancel: () => void;
  onPressSave: () => void;
  onRequestClose: () => void;
};

export const ModalView = ({
  visible,
  modalHeader,
  isTextInputAvailable,
  placeHolderText,
  textInputValue,
  textInputOnChangeText,
  onPressCancel,
  onPressSave,
  onRequestClose,
}: Props) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalView}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
            {modalHeader}
          </Text>
          {isTextInputAvailable && (
            <TextInput
              style={styles.textInput}
              placeholder={placeHolderText}
              placeholderTextColor={"grey"}
              value={textInputValue}
              onChangeText={textInputOnChangeText}
            />
          )}
          <View style={styles.modalButtonOrientation}>
            <Button
              onPress={onPressCancel}
              style={[styles.modalButton, { backgroundColor: "red" }]}
              labelStyle={{ fontSize: 18, color: "white" }}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              onPress={onPressSave}
              style={[styles.modalButton, { backgroundColor: "forestgreen" }]}
              labelStyle={{ fontSize: 18, color: "white" }}
            >
              <Text>{isTextInputAvailable === true ? "Save" : "Delete"}</Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // --- Modal / Input UI ---
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalView: {
    width: 320,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center",
  },

  textInput: {
    width: "100%",
    height: 48,
    borderColor: "#d1d1d1",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 20,
    color: "#222",
    backgroundColor: "#f9f9f9",
  },

  modalButtonOrientation: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    marginHorizontal: 6,
    justifyContent: "center",
  },
});
