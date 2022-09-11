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
    const shakeAnimation = useRef(new Animated.Value(0)).current
    const [shake, setShake] = useState(0)

    useEffect(() => {
        Animated.timing(shakeAnimation, {
            toValue: shake,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true
        }).start()
    }, [shake])

    //Size animation
    const sizeAnimation = useRef(new Animated.Value(0)).current
    const [sizeChange, setSizeChange] = useState(0)

    const firstLoad = useRef(true) //First load var used for useState

    useEffect(() => {
        firstLoad.current ? firstLoad.current=false : setSearching(!searching)
        /*     animation
        setTimeout(() => setSearching(!searching), 100)
        Animated.timing(sizeAnimation, {
            toValue: sizeChange,
            duration: 500,
            easing: Easing.linear,
            useNativeDriver: true
        }).start()
        */
    }, [sizeChange])


    function searchUser(pseudo) {
        if(!pseudo || (pseudo && pseudo.replace(/\s+/g, '') == '')){ //If no pseudo typed
            //setSearching(false) //Close the input text
            setSizeChange(1-sizeChange) //Change size of the button and close input
        }else{ //If pseudo
            fetch(global.urlAPI+'user?pseudo='+pseudo) //Get the user infos
                .then((res) => res.status == '404' ? [] : res.json()) //Json the results
                .then((json) => {
                    if(json.length == 1){ //If user found
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
                            .then((listSearch) => AsyncStorage.setItem('lastResearch', JSON.stringify(listSearch)) //Set the new search history
                                    .then(() => {
                                        setSearching(false) //Close the input
                                        props.navigationProps.push('UserPage', {id : json[0]._id_user}) //Navigate to user search page
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
        <Animated.View
            style={[
                SearchStyle.ViewSearch
                ,{
                width: searching ? '95%' : null, //Set width of the view depending on the keyboard state
                height: searching ? 50 : '13%', //Set height of the view depending on the keyboard state
                transform: [
                    //Shake animation
                    {
                        translateX: shakeAnimation.interpolate({
                            inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                            outputRange: [0, 0, 10, 0, -10, 0, 10, 0, -10, 0, 0]
                        })
                    },

                    //Size animation
                    /*
                    {
                        scale: sizeAnimation.interpolate({
                            inputRange: [0, 0.9, 1],
                            outputRange: [1, 0.7, 1]
                        }),
                    },
                    {
                        translateY: sizeAnimation.interpolate({
                            inputRange: [0, 0.9, 1],
                            outputRange: [0, -200, 0]
                        })
                    },
                    {
                        translateX: sizeAnimation.interpolate({
                            inputRange: [0, 0.9, 1],
                            outputRange: [0, 80, 0]
                        })
                    },
                    */
                ],
                opacity: sizeAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 10/1]
                })
            }]}
        >
            <DropShadow
                
                style={[/*SearchStyle.ViewSearch*/, {
                    
                    shadowOpacity: searching ? 0.1 : 0.7,

                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowRadius: 5,
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
                        
                            {/* Search button */}
                            <TouchableOpacity
                                style={[SearchStyle.ButtonSearch, {
                                    height: searching ? 50 : '100%', 
                                    aspectRatio : searching ? 10/1 : 1,
                                    justifyContent: searching ? 'flex-start' : 'center'}]}
                                    activeOpacity={0.5}
                                    onPress={() => {
                                            searching ? searchUser(searchedUser) : setSizeChange(1-sizeChange) //setSearching(!searching)
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
                        
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </DropShadow>
        </Animated.View>
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