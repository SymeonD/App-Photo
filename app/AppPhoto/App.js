import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConnectionScreen from "./screens/Connection";
import UserPage from "./screens/UserPage";
import DetailPhoto from './screens/DetailPhoto'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>{
        <Stack.Navigator>
            <Stack.Screen name="ConnectionScreen" component={ConnectionScreen} />
            <Stack.Screen name="UserPage" component={UserPage} />
            <Stack.Screen name="AppVrai" component={AppVrai} />
            <Stack.Screen name="DetailPhoto" component={DetailPhoto} />
        </Stack.Navigator>
    }</NavigationContainer>
  );
}