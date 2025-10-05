import React from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  step: number;
  totalSteps: number;
};

export default function ProgressBar({ step, totalSteps }: Props) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(step / totalSteps) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: { paddingHorizontal: 20, marginBottom: 24 },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#3498DB", borderRadius: 4 },
});
