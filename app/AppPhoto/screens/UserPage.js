import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";


function UserPage({route, navigation}){
    const id_user = route.params.id;

    const [isLoadingUser, setLoadingUser] = useState(true);
    const [dataUser, setDataUser] = useState([]);

    const [isLoadingPostToday, setLoadingPostToday] = useState(true);
    const [dataPostToday, setdataPostToday] = useState([]);

    const [isLoadingPostNotToday, setLoadingPostNotToday] = useState(true);
    const [dataPostNotToday, setdataPostNotToday] = useState([]);

    //Get the informations of the user
    useEffect(() => {
        fetch('http://localhost:8000/user?id='+id_user, {method:"GET"})
          .then((response) => 
            response.json())
          .then((json) => {
            setDataUser(json[0])
          })
          .catch((error) => console.error(error))
          .finally(() => setLoadingUser(false));
      }, []);

    //Get today's post and photos
    useEffect(() => {
        fetch('http://localhost:8000/posts?id='+id_user+'&date='+new Date().toLocaleDateString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'), {method:"GET"})
          .then((response) => 
            response.json())
          .then((json) => {
            let photos = [];
            fetch('http://localhost:8000/photos?id='+json[0]._id_post, {method:"GET"})
            .then((response) => response.json())
            .then((json) => photos.push(json))
            .then(() => setdataPostToday(photos))
            .finally(() => setLoadingPostToday(false));
          })
          .catch((error) => console.error(error))
          
      }, []);

    //Get previous days posts and photos
    useEffect(() => {
        fetch('http://localhost:8000/posts?id='+id_user, {method:"GET"})
          .then((responsePost) => responsePost.json())
          .then((jsonPost) => { //json of all posts
            let photos = [];
            let urls = [];
            for(let i of jsonPost){ //Get all photos from the posts
                urls.push('http://localhost:8000/photos?id='+i._id_post)
            }
            Promise.all(urls.map(url => fetch(url)))
                .then((responses) => Promise.all(responses.map(res => res.status != '404' ? res.json() : null))
                    .then((json) => {
                        for(let j of json){ //For every post
                            if(j != null){
                                for(let k of j){ //For every photo
                                    photos.push(k)
                                }
                            }
                        }
                    })
                    .then(() => setdataPostNotToday(photos))
                    .finally(() => setLoadingPostNotToday(false))
                )
          })
          .catch((error) => console.error(error))
          
      }, []);

    return (
        <View style={{flex: 1, flexDirection: "column", backgroundColor: "#f8edeb"}}>

            {/* Header */}
            <View style={{alignItems: "center", height:50}}>
                <Image
                    style={styles.image} 
                    source={require("../assets/log2.png")}
                />
            </View>

            {/* User infos */}
            <View style={styles.container_user}>
                <View style={{flexDirection:"row", alignItems:"center", margin: 10, justifyContent:"space-between"}}>
                    {isLoadingUser ? <Text>Loading profile picture</Text> : 
                    <Image 
                        source={{uri:'http://localhost:8000/'+dataUser._pseudo_user+'/'+dataUser._profile_picture_user}}
                        style={styles.profile_pic}
                    />}
                    <View style={styles.container_text_user}>
                        <Text style={styles.pseudo}>
                            {isLoadingUser ? "loading pseudo" : dataUser._pseudo_user}
                        </Text>
                        <Text style={styles.description}>
                            {isLoadingUser ? "Loading description" : dataUser._description_user}
                        </Text>
                    </View> 
                </View>
                
            </View>

            {/* Posts */}
            <View>
                {/* Add line Today */}
                <Text>
                    Today
                </Text>
                {isLoadingPostToday ? <Text>Loading...</Text> : 
                <FlatList
                    horizontal={true} 
                    showsHorizontalScrollIndicator={false} 
                    data={dataPostToday[0]}
                    renderItem={({item, index, separators}) => (
                        <Image
                            source={{uri:'http://localhost:8000/'+dataUser._pseudo_user+'/'+item._link_photo}}
                            style={styles.image}
                        >{/*console.log(item)*/}</Image>
                    )}
                />}
                {/* Add line not today */}
                <Text>
                    Not today
                </Text>
                {isLoadingPostNotToday ? <Text>Loading...</Text> : 
                <FlatList
                    horizontal={true} 
                    showsHorizontalScrollIndicator={false} 
                    data={dataPostNotToday}
                    renderItem={({item, index, separators}) => (
                        <Image
                            source={{uri:'http://localhost:8000/'+dataUser._pseudo_user+'/'+item._link_photo}}
                            style={styles.image}
                        >{/*console.log(item)*/}</Image>
                    )}
                />}

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container_user:{
        flex: 8,
        flexDirection: "column",
        backgroundColor: "#f8edeb",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginLeft: 30
    },

    container_text_user:{
        margin: 30,
    },

    pseudo:{
        fontSize: 30,
        marginBottom: 5,
        color: "#ffb5a7"
    },

    description:{
        fontSize: 15,
        color: "#ffb5a7"
    },

    profile_pic:{
        marginTop: 0,
        height: 100,
        width: 100,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: "#ffb5a7",
        overflow: 'hidden'
    },

    image: {
        marginTop: 0,
        height: 50,
        width: 50,
    },
})

export default UserPage;