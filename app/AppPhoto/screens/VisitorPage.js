import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Button } from "react-native-paper";

function VisitorPage({route, navigation}){

    const [lastResearch, setLastResearch] = useState([]);
    const [lastResearchUpdated, setLastResearchUpdated] = useState(false);

    useEffect(() => {
        if(!lastResearchUpdated){
            let lasts = [];
            AsyncStorage.getItem('lastResearch') //Get Ids of the last searched profiles
                .then((res) => JSON.parse(res))
                .then((json) => {
                    Promise.all(json.map(last => fetch(global.urlAPI+'user?id='+last, {method:'GET'})))
                        .then((responses) => Promise.all(responses.map(response => response.json()))
                            .then((responsesJson) => Promise.all(responsesJson.map(responseJson => lasts.push(responseJson[0])))
                                .then(() => setLastResearch(lasts))
                                .then(() => setLastResearchUpdated(true))
                                .then(() => console.log(lastResearch))
                            )
                        )
                })
        }
    })

    return (
        <View
            style={{margin: 10, backgroundColor: '#f8edeb'}}
        >
            {/* Header */}
            <View style={{alignItems: "center", height:50}}>
                <Image
                    style={styles.imageTop} 
                    source={require("../assets/log2.png")}
                />
            </View>

            <Text
                style={styles.textResearch}
            >
                Your last researchs :
            </Text>

            <FlatList
                style={{width:'100%'}}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                data={lastResearch}
                renderItem={({item, index, separators}) => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('UserPage', {id: item._id_user})}
                        style={[styles.buttonUser, {marginLeft: index == 0 ? 0 : 5, marginRight: index == lastResearch.length-1 ? 0 : 5}]}
                    >
                        <Image
                            source={{uri:global.urlAPI+item._pseudo_user+'/'+item._profile_picture_user}}
                            style={styles.imageUser}
                        />
                        <Text
                            style={styles.pseudoUser}
                        >
                            {item._pseudo_user}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            <Image
                source={{uri:urlAPI+'/resources/visitorNotLogged'}}
                style={styles.imageNotLogged}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    imageTop: {
        marginTop: 0,
        width: 50,
        height: 50,
    },

    textResearch: {
        fontSize: 25,
        color: '#ffb5a7',
        marginTop: 35
    },

    buttonUser: {
        height: 170,
        width: 120,
        backgroundColor: '#f9dcc4',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20
    },

    imageUser: {
        height: 120,
        aspectRatio: 1,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },

    pseudoUser: {
        marginTop: 10,
        fontSize: 20,
    },

    imageNotLogged: {
        
    }
})

export default VisitorPage;