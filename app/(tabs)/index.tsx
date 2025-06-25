import { StyleSheet, View, Text, FlatList } from "react-native";
import { FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useEffect, useState } from "react";
import { Cashbook } from "@/data/cashbooks";
import { useRouter } from "expo-router";
import {
  initDB,
  insertCashbook,
  getTotalIncomeAndSpentAmount,
  fetchCashbooksWithBalance,
  renameCashbookName,
  deleteCashbookById,
} from "@/utills/db";
import { useFocusEffect } from "@react-navigation/native";
import CashbookItem from "@/components/CashbookItem";
import { ModalView } from "@/components/ModalView";
import { ProfileCard } from "@/components/ProfileCard";
import { IncomeSpentCard } from "@/components/IncomeSpentCard";

export default function HomeScreen() {
  const [visibleMenuId, setVisibleMenuId] = useState<number | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [cashbooks, setCashbooks] = useState<Cashbook[]>([]);
  const [cashbookToModify, setCashbookToModify] = useState<Cashbook | null>(
    null
  );
  const [newName, setNewName] = useState("");
  const [newCashbook, setNewCashbook] = useState("");
  const [income, setIncome] = useState(1);
  const [spent, setSpent] = useState(1);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        const allBooks = await fetchCashbooksWithBalance();
        setCashbooks(allBooks);
        const { totalIncome, totalSpent } =
          await getTotalIncomeAndSpentAmount();
        setIncome(totalIncome);
        setSpent(totalSpent);
      };
      fetch();
    }, [])
  );

  useEffect(() => {
    const setup = async () => {
      await initDB();
    };
    setup();
  }, []);

  const actions = [
    {
      icon: "message-text",
      label: "Chat",
      onPress: () => {
        console.log("Going to chat screen");
        router.push("/test");
      },
    },
    {
      icon: "plus",
      label: "Add New Cashbook",
      onPress: () => setModalVisible(true),
    },
  ];

  const handleItemPress = (item: number) => {
    router.push(`/CashbookItems/${item}`);
  };

  const handleInsertNewCashbook = async () => {
    await insertCashbook(newCashbook);
    const updatedCashbooks = await fetchCashbooksWithBalance();
    setCashbooks(updatedCashbooks);
    setNewCashbook("");
    setModalVisible(false);
  };

  const handleRenameCashbook = async () => {
    await renameCashbookName({
      name: newName,
      id: cashbookToModify!.id,
    });
    const allBooks = await fetchCashbooksWithBalance();
    setCashbooks(allBooks);
    setRenameModalVisible(false);
    setVisibleMenuId(null);
    setCashbookToModify(null);
  };

  const handleDeleteCashbook = async () => {
    await deleteCashbookById({
      id: cashbookToModify!.id,
    });
    const allBooks = await fetchCashbooksWithBalance();
    setCashbooks(allBooks);
    setDeleteModalVisible(false);
    setCashbookToModify(null);
  };

  const renderItem = ({ item }: { item: Cashbook }) => {
    return (
      <CashbookItem
        item={item}
        visibleMenuId={visibleMenuId}
        onPress={() => handleItemPress(item.id)}
        onRename={() => {
          setCashbookToModify(item);
          setNewName(item.name);
          setRenameModalVisible(true);
          setVisibleMenuId(item.id);
        }}
        onDelete={() => {
          setCashbookToModify(item);
          setDeleteModalVisible(true);
          setVisibleMenuId(null);
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={cashbooks}
        renderItem={renderItem}
        keyExtractor={(cashbook) => cashbook.id.toString()}
        ListHeaderComponent={
          <>
            {/* Profile Card */}
            <ProfileCard />

            {/* Income /Spent Card */}
            <IncomeSpentCard
              labelIn="Total Income"
              labelOut="Total Spent"
              amountIn={income}
              amountOut={spent}
            />

            <View style={{ height: 30, paddingTop: 8 }}>
              <Text style={{ color: "black" }}>Your Books</Text>
            </View>
          </>
        }
      />

      {/* Floating Action Button  */}
      <FAB.Group
        open={fabOpen}
        visible={true}
        icon={fabOpen ? "close" : "plus"}
        color="black"
        actions={actions}
        onStateChange={({ open }) => setFabOpen(open)}
        onPress={() => {}}
        fabStyle={styles.fab}
      />

      {/* Modal To Insert New Cashbook */}
      <ModalView
        visible={modalVisible}
        modalHeader="Create new Cashbook"
        isTextInputAvailable={true}
        placeHolderText="Enter Cashbook Name"
        textInputValue={newCashbook}
        textInputOnChangeText={setNewCashbook}
        onPressCancel={() => setModalVisible(false)}
        onPressSave={handleInsertNewCashbook}
        onRequestClose={() => setModalVisible(false)}
      />

      {/* Modal To Rename Cashbook */}
      <ModalView
        visible={renameModalVisible}
        modalHeader="Rename Cashbook"
        isTextInputAvailable={true}
        placeHolderText="Enter Cashbook Name"
        textInputValue={newName}
        textInputOnChangeText={setNewName}
        onPressCancel={() => {
          setRenameModalVisible(false);
          setVisibleMenuId(null);
          setCashbookToModify(null);
        }}
        onPressSave={handleRenameCashbook}
        onRequestClose={() => setRenameModalVisible(false)}
      />

      {/* Modal to Delete Cashbook */}
      <ModalView
        visible={deleteModalVisible}
        modalHeader={`Are You Sure You Want To Delete ${cashbookToModify?.name} Cashbook?`}
        isTextInputAvailable={false}
        placeHolderText=""
        textInputValue=""
        textInputOnChangeText={() => {}}
        onPressCancel={() => {
          setDeleteModalVisible(false);
          setCashbookToModify(null);
        }}
        onPressSave={handleDeleteCashbook}
        onRequestClose={() => setDeleteModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    paddingHorizontal: 12,
  },

  // --- Reusable Layout ---
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  alignCenter: {
    alignItems: "center",
  },

  // --- FAB ---
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#fbd203",
    borderRadius: 28,
  },
});
