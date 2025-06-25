import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native";
import { Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Transaction } from "@/data/cashbooks";
import {
  fetchCashbooks,
  fetchTransactionByCashbookId,
  initDB,
  insertTransaction,
} from "@/utills/db";
import { IncomeSpentCard } from "@/components/IncomeSpentCard";

export default function SingleCashbook() {
  //Local Parameters
  const { item } = useLocalSearchParams(); //which is a string
  const cashbookId = parseInt(item as string, 10);
  console.log("Parsed ID:", cashbookId);

  const navigation = useNavigation();

  //Hooks
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"cash in" | "cash out">("cash in");
  const [inputAmount, setInputAmount] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  //functions
  const calculateSums = (txns: Transaction[]) => {
    const totalIn = txns
      .filter((t) => t.type === "cash in")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOut = txns
      .filter((t) => t.type === "cash out")
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalIn, totalOut };
  };

  const loadTransactions = useCallback(async () => {
    await initDB();
    const allTransactions = await fetchTransactionByCashbookId({
      cashbook_id: cashbookId,
    });
    setTransactions(allTransactions);
    const { totalIn, totalOut } = calculateSums(allTransactions);
    setTotalIn(totalIn);
    setTotalOut(totalOut);
  }, [cashbookId]);

  const fetchHeader = useCallback(async () => {
    const cashbooks = await fetchCashbooks();
    const current = cashbooks.find((c) => c.id === cashbookId);
    if (current) {
      navigation.setOptions({
        title: current.name,
        color: "white",
      });
    }
  }, [cashbookId]);

  const handleInsertTransaction = async () => {
    await insertTransaction({
      cashbook_id: cashbookId,
      description: inputDescription || "",
      type: modalType,
      amount: parseInt(inputAmount, 10),
      date: new Date(),
    });

    await loadTransactions();
    resetModal();
  };

  const resetModal = () => {
    setModalVisible(false);
    setInputAmount("");
    setInputDescription("");
  };

  useEffect(() => {
    fetchHeader();
    loadTransactions();
  }, [loadTransactions, fetchHeader]);

  //render

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.cashBookItem}>
      <View style={styles.cashBookLeft}>
        {/* Start Icon  */}
        <View style={styles.cashBookIcon}>
          <MaterialCommunityIcons
            name="book-variant"
            size={30}
            color={"#000"}
          ></MaterialCommunityIcons>
        </View>

        {/* Transaction Description and Date */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "column" }}>
            <Text style={styles.cashBookName}>{item.description}</Text>
            <Text style={{ fontSize: 12, color: "black" }}>
              {new Date(item.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </View>
        </View>
        {/* Money on that transaction */}
        <Text
          style={
            item.type === "cash in"
              ? [styles.cashBookAmount, { color: "forestgreen" }]
              : [styles.cashBookAmount, { color: "red" }]
          }
        >
          {item.type === "cash in" ? " " : "- "}${item.amount}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(transaction) => transaction.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            {/* Income /Spent Card */}
            <IncomeSpentCard
              labelIn="Total In"
              labelOut="Total Out"
              amountIn={totalIn}
              amountOut={totalOut}
            />

            <View style={{ height: 30, flexDirection: "column-reverse" }}>
              <Text style={{ color: "black" }}>Your Transactions</Text>
            </View>
          </>
        }
      />

      <View style={styles.cashInOutButtonContainer}>
        <Button
          onPress={() => {
            setModalVisible(true);
            setModalType("cash in");
          }}
          style={[styles.cashInOutButton, { backgroundColor: "forestgreen" }]}
        >
          <Text style={{ color: "black", fontSize: 16 }}> + CASH IN</Text>
        </Button>
        <Button
          onPress={() => {
            setModalVisible(true);
            setModalType("cash out");
          }}
          style={[styles.cashInOutButton, { backgroundColor: "red" }]}
        >
          <Text style={{ color: "black", fontSize: 16 }}>- CASH OUT</Text>
        </Button>
      </View>

      {/* Modal To Insert New Transaction */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalView}>
            {/* Modal Title */}
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}
            >
              {modalType === "cash in" ? "ADD CASH IN" : "ADD CASH OUT"}
            </Text>
            {/* Entering Amount */}
            <TextInput
              style={styles.textInput}
              placeholder={
                modalType === "cash in"
                  ? "Enter Cash In Amount"
                  : "Enter Cash Out Amount"
              }
              value={inputAmount}
              placeholderTextColor={"grey"}
              onChangeText={setInputAmount}
            />

            <TextInput
              style={styles.textInput}
              placeholder={"Description(If needed)"}
              placeholderTextColor={"grey"}
              value={inputDescription}
              onChangeText={setInputDescription}
            />
            <View style={styles.modalButtonOrientation}>
              <Button
                onPress={resetModal}
                style={[styles.modalButton, { backgroundColor: "red" }]}
                labelStyle={{ fontSize: 18, color: "white" }}
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                onPress={handleInsertTransaction}
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "forestgreen",
                  },
                ]}
                labelStyle={{ fontSize: 18, color: "white" }}
              >
                <Text>Save</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    paddingHorizontal: 12,
  },

  // --- Cards ---
  card: {
    backgroundColor: "#ffffff",
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // --- Reusable Layout ---
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  alignCenter: {
    alignItems: "center",
  },

  // --- Avatar/Profile ---
  avatar: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderColor: "#ddd",
    borderWidth: 1,
  },

  textContainer: {
    marginLeft: 12,
  },

  welcomeText: {
    fontSize: 18,
    color: "#888",
  },

  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },

  // --- Overview (Pie/Income/Spent) ---
  overViewDashBoard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },

  incomeSpentSection: {
    gap: 12,
  },

  label: {
    fontSize: 16,
    color: "#444",
  },

  amount: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },

  colorBar: {
    height: 20,
    width: 8,
    borderRadius: 4,
    marginRight: 4,
  },

  // --- Cashbook List Item ---
  cashBookItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    justifyContent: "space-between",
  },

  cashBookLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  cashBookIcon: {
    backgroundColor: "#e8f0fe",
    borderRadius: 6,
    padding: 6,
    marginRight: 10,
  },

  cashBookName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#222",
  },

  cashBookAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  menu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
  },

  // --- FAB ---
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#fbd203",
    borderRadius: 28,
  },

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

  cashInOutButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    left: 0,
    right: 0,
    bottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 16,
    position: "absolute",
  },

  cashInOutButton: {
    width: 150,
    height: 40,
    borderRadius: 5,
    borderColor: "white",
    backgroundColor: "forestgreen",
  },
});
