import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConnectionScreen from "./screens/Connection";
import UserPage from "./screens/UserPage";
import DetailPhoto from './screens/DetailPhoto';
import VisitorPage from './screens/VisitorPage';
import SearchButton from './screens/modules/SearchButton';

const Stack = createNativeStackNavigator();

const HERE_API_KEY="7s-KY9LUN6upBN2-XZVY75QNwlV0p6fvj-Pi8Wcvvgs"

export default function App() {
  return (
    <NavigationContainer>{
        <Stack.Navigator>
            <Stack.Screen name="ConnectionScreen" component={ConnectionScreen} />
            <Stack.Screen name="UserPage" component={UserPage} />
            <Stack.Screen name="DetailPhoto" component={DetailPhoto} />
            <Stack.Screen name='VisitorPage' component={VisitorPage} />

            <Stack.Screen name='SearchButton' component={SearchButton} />
        </Stack.Navigator>
    }</NavigationContainer>
  );
}