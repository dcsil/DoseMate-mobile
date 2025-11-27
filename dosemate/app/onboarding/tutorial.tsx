import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface TutorialSlide {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  features: string[];
}

export default function TutorialScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: TutorialSlide[] = [
    {
      iconName: "add-circle",
      iconColor: "#3498DB",
      iconBg: "#D6EAF8",
      title: "Add Your Medications",
      description:
        "Easily add medications by searching our database or scanning prescription labels with your camera.",
      features: ["Search by name", "Search by image", "Dosage tracking"],
    },
    {
      iconName: "notifications",
      iconColor: "#27AE60",
      iconBg: "#D5F4E6",
      title: "Smart Reminders",
      description:
        "Never miss a dose with intelligent reminders that adapt to your schedule and preferences.",
      features: ["Custom timing", "Snooze options", "Multiple notifications"],
    },
    {
      iconName: "bar-chart",
      iconColor: "#8E44AD",
      iconBg: "#E8DAEF",
      title: "Track Your Progress",
      description:
        "See your adherence patterns and share progress reports with your healthcare team.",
      features: ["Daily tracking", "Weekly reports", "Share with doctors"],
    },
    {
      iconName: "shield-checkmark",
      iconColor: "#F39C12",
      iconBg: "#FCF3CF",
      title: "Stay Safe",
      description:
        "Get alerts about drug interactions, side effects, and important medication information.",
      features: ["Interaction alerts", "Side effect info", "Safety reminders"],
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Navigate to main app
      router.push("../main-navigation");
      console.log("Tutorial complete");
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      router.back();
    }
  };

  const skipTutorial = () => {
    router.push("../main-navigation");
    console.log("Tutorial skipped");
  };

  const currentSlideData = slides[currentSlide];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevSlide} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentSlide && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={skipTutorial} style={styles.headerBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: currentSlideData.iconBg },
          ]}
        >
          <Ionicons
            name={currentSlideData.iconName}
            size={48}
            color={currentSlideData.iconColor}
          />
        </View>

        {/* Title and Description */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentSlideData.title}</Text>
          <Text style={styles.description}>{currentSlideData.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {currentSlideData.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Text style={styles.slideCounter}>
          {currentSlide + 1} of {slides.length}
        </Text>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={nextSlide}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  headerBtn: {
    padding: 8,
    minWidth: 60,
  },
  skipText: {
    color: "#3498DB",
    fontSize: 16,
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D5D8DC",
  },
  dotActive: {
    backgroundColor: "#3498DB",
    width: 8,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 32,
    maxWidth: 320,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 17,
    color: "#555",
    textAlign: "center",
    lineHeight: 26,
  },
  featuresContainer: {
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3498DB",
  },
  featureText: {
    fontSize: 16,
    color: "#444",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 32,
    paddingBottom: 32,
  },
  slideCounter: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498DB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
