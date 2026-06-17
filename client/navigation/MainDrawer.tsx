import React from "react";
import { CommonActions } from "@react-navigation/native";
import { View } from "react-native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DashboardScreen from "../screens/DashboardScreen";
import SearchScreen from "../screens/SearchScreen";
import OpenOrderScreen from "../screens/OpenOrderScreen";
import styles from "../styles/MainDrawerStyle";
import { MaterialIcons } from "@expo/vector-icons";
import TasksScreen from "../screens/TasksScreen";

const Drawer = createDrawerNavigator();

export default function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => (
        <View style={{ flex: 1 }}>
          <DrawerContentScrollView {...props} scrollEnabled={false}>
            <DrawerItemList {...props} />
          </DrawerContentScrollView>

          <View style={{ borderTopWidth: 1, borderTopColor: "#333", padding: 10 }}>
            <DrawerItem
              label="Logout"
              labelStyle={{ color: "#F87171" }}
              icon={({ color, size }) => (
                <MaterialIcons name="logout" color="#F87171" size={size} />
              )}
              onPress={async () => {
                await AsyncStorage.removeItem("token");
                props.navigation
                  .getParent()
                  ?.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "Login" }],
                    })
                  );
              }}
            />
          </View>
        </View>
      )}
      screenOptions={() => ({
        headerShown: true,
        headerStyle: styles.headerStyle,
        headerTintColor: "#F5F5F5",
        headerTitleStyle: styles.headerTitleStyle,
        // Remove the header's bottom shadow line so it blends into the screen
        headerShadowVisible: false,
        // Match the scene container background to the header/screens so no
        // white seam shows in the gap between the header and screen content
        sceneStyle: styles.sceneStyle,
        drawerStyle: styles.drawerStyle,
        drawerActiveTintColor: "#F5F5F5",
        drawerInactiveTintColor: "#aaa",
      })}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: "Search",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="search" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="OpenOrder"
        component={OpenOrderScreen}
        options={{
          drawerLabel: "Open Order",
          title: "Open Order",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="receipt-long" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          title: "Tasks",
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="checklist" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
