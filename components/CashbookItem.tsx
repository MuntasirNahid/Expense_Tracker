import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { IconButton, Menu } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Cashbook } from "@/data/cashbooks";

type Props = {
  item: Cashbook;
  visibleMenuId: number | null;
  onPress: () => void;
  onRename: () => void;
  onDelete: () => void;
};

const CashbookItem = ({ item, onPress, onRename, onDelete }: Props) => {
  const balance = Math.abs(item.netBalance);
  const isPositive = item.netBalance >= 0;
  console.log("Render", item.id);

  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <Pressable onPress={onPress}>
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

          {/* CashBook Name */}
          <View style={{ flex: 1 }}>
            <Text style={styles.cashBookName}>{item.name}</Text>
          </View>
          {/* Total Money on that cashbook */}
          <Text
            style={[
              styles.cashBookAmount,
              { color: isPositive ? "forestgreen" : "red" },
            ]}
          >
            {isPositive ? "$" : "-$"}
            {balance}
          </Text>
        </View>

        <Menu
          style={styles.menu}
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            title="Rename "
            onPress={() => {
              onRename();
              setMenuVisible(false);
            }}
          />
          <Menu.Item title="Delete " onPress={onDelete} />
        </Menu>
      </View>
    </Pressable>
  );
};

export default React.memo(CashbookItem);

const styles = StyleSheet.create({
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
});
