import React, { useState, useEffect, useRef } from "react";
import { View, Image, Text, StyleSheet } from "react-native";



const DetailPhoto = ({route, navigation}) => {
    const [photo, setPhoto] = useState(route.params.data);
    const [post, setPost] = useState(null)
    const [isPostLoading, setPostLoading] = useState(true)
    const dataUser = route.params.user;
    const photos = route.params.photos;
    const [index, setIndex] = useState(route.params.index);

    //For scroll refresh
    const y = useRef()
    const x = useRef()

    useEffect(() => {
        fetch(global.urlAPI+'post?id='+photos[index]._id_post, {method:"GET"})
            .then((res) => res.json())
            .then((json) => setPost(json[0]))
            .finally(() => setPostLoading(false))
            .catch((e) => console.error(e))
    })

    function closeDetail() {
        navigation.goBack()
    }

    function nextDetail() {
        //navigation.goBack()
        if(index < photos.length-1){
            setIndex(index+1);
        }
    }

    function previousDetail() {
        //navigation.goBack()
        if(index >= 1){
            setIndex(index-1);
        }
    }

    return (
        <View
            onTouchStart={e => {
                y.current = e.nativeEvent.pageY
                x.current = e.nativeEvent.pageX
            }}
            onTouchEnd={e => {
                //Down side
                if ((y.current - e.nativeEvent.pageY) < -200) { //200 To not close when wanting to go next or previous
                    closeDetail()
                }

                //Left swipe
                if ((x.current - e.nativeEvent.pageX) > 100) {
                    nextDetail()
                }

                //Right swipe
                if ((x.current - e.nativeEvent.pageX) < -100) {
                    previousDetail()
                }
                
            }}
        >
            <View
                style={{borderColor: '#ffb5a7', borderBottomWidth: 10}}
            >
                <Image
                    source={{uri:global.urlAPI+dataUser._pseudo_user+'/'+photos[index]._id_post+'/'+photos[index]._link_photo}}
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