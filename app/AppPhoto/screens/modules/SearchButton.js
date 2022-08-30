import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, KeyboardAvoidingView, View, Image, TextInput, Easing, StyleSheet, TouchableWithoutFeedback, Keyboard, Platform, BackHandler, Text, Animated } from 'react-native'
import DropShadow from 'react-native-drop-shadow';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SearchButton(props) {

    //Boolean for button styles
    const [searching, setSearching] = useState(false)

    //String value of the search input
    const [searchedUser, setSearchedUser] = useState(null);

    //Value of the placeholder
    const [placeHolderUser, setPlaceHolderUser] = useState('Enter a user pseudo')

    //Shake animation
    const animation = useRef(new Animated.Value(0)).current
    const [shake, setShake] = useState(0)

    useEffect(() => {
        Animated.timing(animation, {
            toValue: shake,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true
        }).start()
    }, [shake])

    function searchUser(pseudo) {
        if(!pseudo || (pseudo && pseudo.replace(/\s+/g, '') == '')){
            setSearching(false)
        }else{
            fetch(global.urlAPI+'user?pseudo='+pseudo)
                .then((res) => res.status == '404' ? [] : res.json())
                .then((json) => {
                    if(json.length == 1){
                        AsyncStorage.getItem('lastResearch') //First get the elements already in the lastSearch
                            .then((resResearch) => JSON.parse(resResearch))
                            .then((jsonResearch) => {
                                if(jsonResearch == null){ //If empty create the list
                                    jsonResearch = []
                                }else{  //If exists remove if pseudo already in it
                                    const index = jsonResearch.indexOf(json[0]._id_user)
                                    if(index != -1){ //if found
                                        jsonResearch.splice(index, 1)
                                    }
                                }
                                jsonResearch.unshift(json[0]._id_user) //Append the new one to the first element of the array
                                return jsonResearch //Return the list
                            })
                            .then((listSearch) => AsyncStorage.setItem('lastResearch', JSON.stringify(listSearch))
                                    .then(() => {
                                        setSearching(false)
                                        props.navigationProps.push('UserPage', {id : json[0]._id_user})
                                    })
                            )
                        
                    }else if(json.length >= 1){
                        //TODO: Implement list of results
                    }else{ //No users with the pseudo
                        setShake(1-shake) //shake the input text
                        setPlaceHolderUser('No users found with this pseudo')
                        setSearchedUser('')
                        setTimeout(() => {
                            setPlaceHolderUser('Enter a user pseudo')
                        }, 3000)
                    }
                }) 
                .catch((e) => console.error(e))
        }
    }

    return (
        /*
        <TouchableWithoutFeedback
            onPress={() => {
                Keyboard.dismiss
                setSearching(false)
            }}
            style={{flex:1}}
        >
        */
        <DropShadow
            style={[SearchStyle.ViewSearch, {
                width: searching ? '95%' : null, //Set width of the view depending on the keyboard state
                height: searching ? 50 : '13%', //Set height of the view depending on the keyboard state
                shadowOpacity: searching ? 0.1 : 0.7,
            }]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS == "ios" ? "padding" : 'height'}
                style={{width: '100%', height:'100%', margin: 0, padding: 0}}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : -500}
                enabled={true}
            >
                
                <TouchableWithoutFeedback
                    onPress={() => {
                        Keyboard.dismiss
                        //setSearching(false)
                    }}
                    style={{flex:1}}
                >
                    <Animated.View
                        style={{
                            transform: [
                                {
                                    translateX: animation.interpolate({
                                        inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                                        outputRange: [0, 0, 10, 0, -10, 0, 10, 0, -10, 0, 0]
                                    })
                                },
                                /*
                                {
                                    translateY: animation.interpolate({
                                        inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                                        outputRange: [0, 0, 0, 0, 0, 0, 10, -10, 10, -10, 0]
                                    })
                                }
                                */
                            ]
                        }}
                    >
                        {/* Search button */}
                        <TouchableOpacity
                            style={[SearchStyle.ButtonSearch, {
                                height: searching ? 50 : '100%', 
                                aspectRatio : searching ? 10/1 : 1,
                                justifyContent: searching ? 'flex-start' : 'center'}]}
                                onPress={() => {
                                        searching ? searchUser(searchedUser) : setSearching(!searching)
                                    }}
                        >
                            {searching ?
                                
                                    <TextInput
                                        style={[SearchStyle.InputSearch]}
                                        placeholder={placeHolderUser}
                                        autoFocus={true}
                                        onBlur={() => {
                                            setSearching(!searching)
                                        }}
                                        returnKeyType='search'
                                        onChangeText={(text) => setSearchedUser(text)}
                                        onSubmitEditing={() => searchUser(searchedUser)}
                                        blurOnSubmit={false} //Stop keyboard from hiding when submitting
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                    />
                                
                            : null}
                            <View
                                style={{justifyContent: 'center'}}
                            >
                                <Image
                                    source={require('../../assets/Search.png')}
                                    style={SearchStyle.ImageSearch}
                                />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </DropShadow>
        /*
        </TouchableWithoutFeedback>
        */
    )
}

const SearchStyle = StyleSheet.create({

    ViewSearch:{
        aspectRatio: 1,
        justifyContent:'flex-end', 
        position: 'absolute', 
        right: 10, 
        bottom: 10,
        padding: 0,
        borderRadius: 100,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowRadius: 5,
    },

    ButtonSearch:{
        borderRadius: 100, 
        maxWidth:'105%',
        aspectRatio: 1, 
        backgroundColor: '#f9dcc4',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        flexDirection: 'row',
    }, 

    InputSearch:{
        height: '100%',
        width: '85%',
        marginLeft: 10,
        fontSize: 15
    },  

    ImageSearch:{
        height: '70%', 
        aspectRatio: 842/936, 
        alignSelf: 'center'
    }
})