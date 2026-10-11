import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const HOME = "https://booknbuy360.netlify.app";

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" backgroundColor="#0A2E1F" />
      <WebView
        source={{ uri: HOME }}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        allowsFileAccess
        mediaPlaybackRequiresUserAction={false}
        userAgent="BookNBuyApp/1.0 (Android; PWA-shell)"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A2E1F" },
  web: { flex: 1 },
});
