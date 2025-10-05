import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface TutorialSlide {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
  imageUrl: string;
  gradientColors: [string, string];
}

export default function TutorialScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: TutorialSlide[] = [
    {
      iconName: "add-circle-outline",
      iconColor: "#3498DB",
      title: "Add Your Medications",
      description:
        "Easily add medications by searching or scanning barcodes. Set dosages and frequencies with just a few taps.",
      imageUrl:
        "https://images.unsplash.com/photo-1675851143055-23ae996bb212?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      gradientColors: ["#5DADE2", "#3498DB"],
    },
    {
      iconName: "notifications-outline",
      iconColor: "#27AE60",
      title: "Smart Reminders",
      description:
        "Get personalized reminders that fit your schedule. Never miss a dose with gentle notifications and easy logging.",
      imageUrl:
        "https://images.unsplash.com/photo-1682706841289-9d7ddf5eb999?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      gradientColors: ["#52BE80", "#27AE60"],
    },
    {
      iconName: "bar-chart-outline",
      iconColor: "#8E44AD",
      title: "Track Your Progress",
      description:
        "Monitor your adherence with detailed analytics. Share reports with your healthcare provider.",
      imageUrl:
        "https://images.unsplash.com/photo-1675851143055-23ae996bb212?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      gradientColors: ["#A569BD", "#8E44AD"],
    },
    {
      iconName: "book-outline",
      iconColor: "#E67E22",
      title: "Learn About Your Meds",
      description:
        "Access easy-to-understand information about your medications, including side effects and interactions.",
      imageUrl:
        "https://images.unsplash.com/photo-1682706841289-9d7ddf5eb999?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
      gradientColors: ["#EB984E", "#E67E22"],
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Navigate to main app
      // router.push("/");
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
    // router.push("/");
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

      {/* Tutorial Content */}
      <View style={styles.content}>
        {/* Visual Area with Gradient */}
        <LinearGradient
          colors={currentSlideData.gradientColors}
          style={styles.visualArea}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.visualContent}>
            {/* Icon Circle */}
            <View style={styles.iconCircle}>
              <Ionicons
                name={currentSlideData.iconName}
                size={48}
                color={currentSlideData.iconColor}
              />
            </View>

            {/* Image Container */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: currentSlideData.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          </View>
        </LinearGradient>

        {/* Content Area */}
        <View style={styles.textArea}>
          <View style={styles.textContent}>
            <Text style={styles.title}>{currentSlideData.title}</Text>
            <Text style={styles.description}>
              {currentSlideData.description}
            </Text>
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
              {currentSlide !== slides.length - 1 && (
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    width: 24,
  },
  content: {
    flex: 1,
  },
  visualArea: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  visualContent: {
    alignItems: "center",
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  imageContainer: {
    width: width - 128,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    opacity: 0.8,
  },
  textArea: {
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  textContent: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  slideCounter: {
    fontSize: 14,
    color: "#888",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498DB",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
