import { StyleSheet, View, Text } from "react-native";
import { Card } from "react-native-paper";
import PieChart from "react-native-pie-chart";

type Props = {
  labelIn: string;
  labelOut: string;
  amountIn: number;
  amountOut: number;
};

export const IncomeSpentCard = ({
  labelIn,
  labelOut,
  amountIn,
  amountOut,
}: Props) => {
  const series = [
    {
      value: amountIn || 1,
      color: "forestgreen",
      label: {
        text: `${Math.round((amountIn / (amountIn + amountOut)) * 100)}%`,
        fontSize: 15,
        outline: "white",
      },
    },
    {
      value: amountOut || 1,
      color: "red",
      label: {
        text: `${Math.round((amountOut / (amountIn + amountOut)) * 100)}%`,
        fontSize: 15,
        outline: "white",
      },
    },
  ];
  return (
    <Card style={styles.card}>
      <Card.Content style={styles.overViewDashBoard}>
        <View style={styles.incomeSpentSection}>
          {[
            {
              label: labelIn,
              amount: `$${amountIn}`,
              color: "forestgreen",
            },
            {
              label: labelOut,
              amount: `$${amountOut}`,
              color: "red",
            },
          ].map((item, idx) => (
            <View
              key={idx}
              style={[styles.row, styles.alignCenter, { gap: 8 }]}
            >
              <View
                style={[styles.colorBar, { backgroundColor: item.color }]}
              />
              <View>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={[styles.amount, { color: item.color }]}>
                  {item.amount}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <PieChart widthAndHeight={100} series={series} />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
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
});
