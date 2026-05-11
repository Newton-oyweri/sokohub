import { View,Text } from "@/components/Themed";
export default function Maize() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text >Maize</Text>
      <View lightColor="#352525" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
}