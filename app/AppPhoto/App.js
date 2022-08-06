import * as React from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConnectionScreen from "./screens/Connection";
import UserPage from "./screens/UserPage";
import AppVrai from './AppVrai';

function HomeScreen({navigation}) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Home Screen</Text>
          <Button
            title='Go to AppVrai screen'
            onPress={() => navigation.navigate('AppVrai')}
          />
          <Button
            title='Go to connection screen'
            onPress={() => navigation.navigate('ConnectionScreen')}
          />
        </View>
    );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>{
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ConnectionScreen" component={ConnectionScreen} />
            <Stack.Screen name="UserPage" component={UserPage} />
            <Stack.Screen name="AppVrai" component={AppVrai} />
        </Stack.Navigator>
    }</NavigationContainer>
  );
}