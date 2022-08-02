import React from "react";
import { View, Text } from "react-native";


function HomePage({route, navigation}){
    const id_user = route.params.id;
    return (
        <View>
            <Text>
                {id_user}
            </Text>
        </View>
    )
}

export default HomePage;