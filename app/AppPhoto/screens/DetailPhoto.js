import React, { useState, useEffect, useRef } from "react";
import { View, Image, Text, StyleSheet } from "react-native";



const DetailPhoto = ({route, navigation}) => {
    const [photo, setPhoto] = useState(route.params.data);
    const [post, setPost] = useState(null)
    const [isPostLoading, setPostLoading] = useState(true)
    const dataUser = route.params.user;

    //For scroll refresh
    const y = useRef()

    useEffect(() => {
        fetch('http://localhost:8000/post?id='+photo._id_post, {method:"GET"})
            .then((res) => res.json())
            .then((json) => setPost(json[0]))
            .finally(() => setPostLoading(false))
            .catch((e) => console.error(e))
    })

    function onRefresh() {
        navigation.goBack()
        console.log('refresh')
    }

    return (
        <View
            onTouchStart={e=> y.current = e.nativeEvent.pageY}
            onTouchEnd={e => {
                // some threshold. add whatever suits you
                if (y.current - e.nativeEvent.pageY < 100) {
                    onRefresh()
                }
            }}
        >
            <View
                style={{borderColor: '#ffb5a7', borderBottomWidth: 10}}
            >
                <Image
                    source={{uri:'http://localhost:8000/'+dataUser._pseudo_user+'/'+photo._id_post+'/'+photo._link_photo}}
                    style={{width:'100%', aspectRatio:1}}
                />
            </View>
            {isPostLoading ? <Text>'Loading Location...'</Text> : 
            <View style={styles.viewLoc}>
                <Image
                    source={require('../assets/Location.png')}
                    style={styles.logos}
                />
                <Text
                    style={styles.localisation}
                >{post._localisation_post}</Text>
            </View>
            }

            {isPostLoading ? <Text>'Loading Description...'</Text> : 
            <View style={styles.viewDesc}>
                <Image 
                    source={require('../assets/Description.png')}
                    style={styles.logos}
                />
                <Text
                    style={styles.description}
                >{post._description_post}</Text>
            </View>
            }
        </View>
    );
}

export default DetailPhoto;

const styles = StyleSheet.create({

    viewLoc: {
        marginTop: 20, 
        marginLeft: 15, 
        marginBottom: 10, 
        flexDirection: 'row'
    },

    localisation: {
        paddingTop: 10,
        fontSize: 25
    },

    viewDesc: {
        margin: 30, 
        marginLeft: 15, 
        marginTop: 10, 
        flexDirection: 'row'
    },

    description: {
        paddingTop: 5,
        fontSize: 20,
        width: '90%'
    },

    logos: {
        height: 50,
        width: 50
    },
})