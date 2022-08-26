import React, { useState, useEffect } from 'react';
import { TouchableOpacity, KeyboardAvoidingView, View, Image, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard, Platform, BackHandler } from 'react-native'
import DropShadow from 'react-native-drop-shadow';

export default function SearchButton({route, navigation}) {

    const [searching, setSearching] = useState(false)

    const [pageOffset, setPageOffset] = useState(0);

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
                height: searching ? 50 : '1%' //Set height of the view depending on the keyboard state
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
                            onPress={() => setSearching(!searching)}
                    >
                        {searching ?
                        <TextInput
                            style={SearchStyle.InputSearch}
                            placeholder='User pseudo'
                            autoFocus={true}
                            onBlur={() => {
                                setSearching(!searching)
                            }}
                            returnKeyType='search'
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
        shadowOpacity: 0.7,
        shadowRadius: 5,
    },

    ButtonSearch:{
        borderRadius: 100, 
        maxWidth:'100%',
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