import { Image } from "expo-image";
import { StyleSheet, View, Text, FlatList } from "react-native";
import userProfile from "@/assets/images/coffee-icon.png";

import { Card } from "react-native-paper";

export const ProfileCard = () => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <Image
            source={userProfile}
            style={styles.avatar}
            testID="profile-avatar"
          />

          <View style={styles.textContainer}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.userName}>Muntasir</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

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
});
