import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./screens/LoginScreen";
import MainDrawer from "./navigation/MainDrawer";
import ItemManageScreen from "./screens/ItamManageScreen";
import { navigationRef } from "./utils/auth";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainDrawer" component={MainDrawer} />
        <Stack.Screen
          name="ItemManage"
          component={ItemManageScreen}
          options={{
            headerShown: true,
            title: "Item Management",
            headerStyle: { backgroundColor: "#1E1E1E" },
            headerTintColor: "#F5F5F5",
            headerTitleStyle: { fontWeight: "700" },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
